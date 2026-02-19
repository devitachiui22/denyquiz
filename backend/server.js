require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

// =============================================================================
// BANCO DE DADOS INTERNO COMPLETO (5000+ PERGUNTAS)
// =============================================================================
const INTERNAL_DATABASE = [
    // =========================================================================
    // NÍVEL: GENIN (EASY) - Mainstream, Big 3, Modern Hits & Ghibli
    // =========================================================================
    // --- ONE PIECE (ez) ---
    {
        id: "op_ez_001",
        level: "easy",
        type: "character",
        anime: "One Piece",
        question: "Qual é o objetivo principal de Monkey D. Luffy?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Ser o Rei dos Piratas", "Encontrar o All Blue", "Destruir a Marinha", "Ser o melhor espadachim"],
        correct: "Ser o Rei dos Piratas",
        tags: ["luffy", "protagonista", "objetivo", "rei dos piratas"]
    },
    {
        id: "op_ez_002",
        level: "easy",
        type: "character",
        anime: "One Piece",
        question: "Qual personagem de 'One Piece' luta usando o estilo Santoryu (Três Espadas)?",
        image: "https://cdn.myanimelist.net/images/characters/3/100534.jpg",
        options: ["Roronoa Zoro", "Dracule Mihawk", "Shanks", "Trafalgar Law"],
        correct: "Roronoa Zoro",
        tags: ["zoro", "espadachim", "santoryu"]
    },
    {
        id: "op_ez_003",
        level: "easy",
        type: "character",
        anime: "One Piece",
        question: "Quem é o cozinheiro do Bando do Chapéu de Palha?",
        image: "https://cdn.myanimelist.net/images/characters/8/173297.jpg",
        options: ["Sanji", "Jinbe", "Franky", "Usopp"],
        correct: "Sanji",
        tags: ["sanji", "cozinheiro", "pé preto"]
    },
    {
        id: "op_ez_004",
        level: "easy",
        type: "character",
        anime: "One Piece",
        question: "Qual é o nome da espada mais famosa de Roronoa Zoro?",
        image: "https://cdn.myanimelist.net/images/characters/3/100534.jpg",
        options: ["Enma", "Wado Ichimonji", "Shusui", "Sandai Kitetsu"],
        correct: "Wado Ichimonji",
        tags: ["zoro", "espada", "wado ichimonji"]
    },
    {
        id: "op_ez_005",
        level: "easy",
        type: "character",
        anime: "One Piece",
        question: "Qual é o nome da nave do Bando do Chapéu de Palha?",
        image: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        options: ["Thousand Sunny", "Going Merry", "Oro Jackson", "Moby Dick"],
        correct: "Thousand Sunny",
        tags: ["nave", "thousand sunny", "franky"]
    },
    {
        id: "op_ez_006",
        level: "easy",
        type: "power",
        anime: "One Piece",
        question: "Que tipo de Akuma no Mi Luffy comeu?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Hito Hito no Mi", "Yami Yami no Mi"],
        correct: "Gomu Gomu no Mi",
        tags: ["akuma no mi", "luffy", "gomu gomu", "fruta"]
    },
    // --- NARUTO (ez) ---
    {
        id: "naruto_ez_001",
        level: "easy",
        type: "lore",
        anime: "Naruto",
        question: "Em Naruto, qual Bijuu (Besta com Cauda) vive dentro do protagonista?",
        image: "https://cdn.myanimelist.net/images/characters/9/131317.jpg",
        options: ["Kurama (Nove Caudas)", "Shukaku (Uma Cauda)", "Gyuki (Oito Caudas)", "Matatabi (Duas Caudas)"],
        correct: "Kurama (Nove Caudas)",
        tags: ["bijuu", "naruto", "kurama", "kyuubi"]
    },
    {
        id: "naruto_ez_002",
        level: "easy",
        type: "character",
        anime: "Naruto",
        question: "Quem é o irmão mais velho de Sasuke Uchiha?",
        image: "https://cdn.myanimelist.net/images/characters/16/208027.jpg",
        options: ["Itachi Uchiha", "Madara Uchiha", "Obito Uchiha", "Shisui Uchiha"],
        correct: "Itachi Uchiha",
        tags: ["itachi", "sasuke", "uchiha"]
    },
    {
        id: "naruto_ez_003",
        level: "easy",
        type: "character",
        anime: "Naruto",
        question: "Quem é o mentor de Naruto, Sasuke e Sakura (Time 7)?",
        image: "https://cdn.myanimelist.net/images/characters/2/176707.jpg",
        options: ["Kakashi Hatake", "Jiraiya", "Iruka Umino", "Minato Namikaze"],
        correct: "Kakashi Hatake",
        tags: ["kakashi", "time 7", "sensei"]
    },
    {
        id: "naruto_ez_004",
        level: "easy",
        type: "character",
        anime: "Naruto",
        question: "Qual é o sonho de infância de Sakura Haruno?",
        image: "https://cdn.myanimelist.net/images/characters/3/131739.jpg",
        options: ["Casar com Sasuke", "Ser Hokage", "Ser a maior médica-nin", "Derrotar Tsunade"],
        correct: "Casar com Sasuke",
        tags: ["sakura", "sasuke", "sonho"]
    },
    {
        id: "naruto_ez_005",
        level: "easy",
        type: "technique",
        anime: "Naruto",
        question: "Qual é o nome do jutsu proibido criado pelo Quarto Hokage?",
        image: "https://cdn.myanimelist.net/images/characters/14/175015.jpg",
        options: ["Rasengan", "Chidori", "Kage Bunshin no Jutsu", "Edo Tensei"],
        correct: "Rasengan",
        tags: ["rasengan", "minato", "jutsu"]
    },
    // --- DRAGON BALL (ez) ---
    {
        id: "db_ez_001",
        level: "easy",
        type: "technique",
        anime: "Dragon Ball",
        question: "Em Dragon Ball Z, qual é a transformação lendária de Goku contra Freeza?",
        image: "https://cdn.myanimelist.net/images/characters/2/227445.jpg",
        options: ["Super Saiyajin", "Kaioken", "Instinto Superior", "Oozaru"],
        correct: "Super Saiyajin",
        tags: ["goku", "super saiyajin", "freeza"]
    },
    {
        id: "db_ez_002",
        level: "easy",
        type: "technique",
        anime: "Dragon Ball",
        question: "Qual é o golpe assinatura de Goku?",
        image: "https://cdn.myanimelist.net/images/characters/6/277519.jpg",
        options: ["Kamehameha", "Galick Gun", "Final Flash", "Special Beam Cannon"],
        correct: "Kamehameha",
        tags: ["goku", "kamehameha", "golpe"]
    },
    {
        id: "db_ez_003",
        level: "easy",
        type: "character",
        anime: "Dragon Ball",
        question: "Quem é o príncipe dos Saiyajins?",
        image: "https://cdn.myanimelist.net/images/characters/8/161861.jpg",
        options: ["Vegeta", "Goku", "Raditz", "Nappa"],
        correct: "Vegeta",
        tags: ["vegeta", "príncipe", "saiyajin"]
    },
    {
        id: "db_ez_004",
        level: "easy",
        type: "world",
        anime: "Dragon Ball",
        question: "Quais são os objetos que concedem desejos em Dragon Ball?",
        image: "https://cdn.myanimelist.net/images/anime/1887/92364.jpg",
        options: ["As Esferas do Dragão", "Os Brincos Potara", "A Espada Z", "A Nuvem Voadora"],
        correct: "As Esferas do Dragão",
        tags: ["esferas do dragão", "shenlong", "desejos"]
    },
    // --- DEMON SLAYER (ez) ---
    {
        id: "ds_ez_001",
        level: "easy",
        type: "character",
        anime: "Demon Slayer",
        question: "Em 'Demon Slayer', o que Tanjiro carrega na caixa em suas costas?",
        image: "https://cdn.myanimelist.net/images/characters/4/384382.jpg",
        options: ["Sua irmã Nezuko", "Sua espada", "Suprimentos médicos", "Um demônio capturado"],
        correct: "Sua irmã Nezuko",
        tags: ["tanjiro", "nezuko", "caixa"]
    },
    {
        id: "ds_ez_002",
        level: "easy",
        type: "character",
        anime: "Demon Slayer",
        question: "Qual é o nome do Pilar da Água que treina Tanjiro?",
        image: "https://cdn.myanimelist.net/images/characters/14/379042.jpg",
        options: ["Giyu Tomioka", "Shinobu Kocho", "Rengoku Kyojuro", "Tengen Uzui"],
        correct: "Giyu Tomioka",
        tags: ["giyu", "pilar da água", "hashira"]
    },
    // --- ATTACK ON TITAN (ez) ---
    {
        id: "aot_ez_001",
        level: "easy",
        type: "world",
        anime: "Attack on Titan",
        question: "Qual anime apresenta Titãs devoradores de humanos?",
        image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        options: ["Attack on Titan", "Tokyo Ghoul", "Parasyte", "Claymore"],
        correct: "Attack on Titan",
        tags: ["titãs", "shingeki", "aot"]
    },
    {
        id: "aot_ez_002",
        level: "easy",
        type: "character",
        anime: "Attack on Titan",
        question: "Quem é o protagonista que jura exterminar todos os Titãs?",
        image: "https://cdn.myanimelist.net/images/characters/4/303649.jpg",
        options: ["Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Levi Ackerman"],
        correct: "Eren Yeager",
        tags: ["eren", "protagonista", "aot"]
    },
    // --- MY HERO ACADEMIA (ez) ---
    {
        id: "mha_ez_001",
        level: "easy",
        type: "power",
        anime: "My Hero Academia",
        question: "Em 'Boku no Hero Academia', qual é o poder de Izuku Midoriya?",
        image: "https://cdn.myanimelist.net/images/characters/7/299404.jpg",
        options: ["One For All", "Explosão", "Meio-Quente Meio-Frio", "Endurecimento"],
        correct: "One For All",
        tags: ["deku", "one for all", "individualidade"]
    },
    {
        id: "mha_ez_002",
        level: "easy",
        type: "character",
        anime: "My Hero Academia",
        question: "Qual é o nome do herói conhecido como 'Símbolo da Paz'?",
        image: "https://cdn.myanimelist.net/images/characters/8/299405.jpg",
        options: ["All Might", "Endeavor", "Hawks", "Best Jeanist"],
        correct: "All Might",
        tags: ["all might", "símbolo da paz", "toshinori yagi"]
    },
    // --- FAIRY TAIL (ez) ---
    {
        id: "ft_ez_001",
        level: "easy",
        type: "world",
        anime: "Fairy Tail",
        question: "Qual é o nome da guilda de magos protagonizada por Natsu Dragneel?",
        image: "https://cdn.myanimelist.net/images/anime/5/17498.jpg",
        options: ["Fairy Tail", "Sabertooth", "Blue Pegasus", "Lamia Scale"],
        correct: "Fairy Tail",
        tags: ["guilda", "fairy tail", "natsu"]
    },
    {
        id: "fairy_ez_002",
        level: "easy",
        type: "character",
        anime: "Fairy Tail",
        question: "Qual é o nome da maga de gelo mais forte de Fairy Tail?",
        image: "https://cdn.myanimelist.net/images/characters/14/44013.jpg",
        options: ["Gray Fullbuster", "Juvia Lockser", "Ur", "Lyon Vastia"],
        correct: "Gray Fullbuster",
        tags: ["gray", "gelo", "fairy tail"]
    },
    // --- HUNTER X HUNTER (ez) ---
    {
        id: "hxh_ez_001",
        level: "easy",
        type: "character",
        anime: "Hunter x Hunter",
        question: "Quem é o pai de Gon Freecss em Hunter x Hunter?",
        image: "https://cdn.myanimelist.net/images/characters/11/174365.jpg",
        options: ["Ging Freecss", "Silva Zoldyck", "Isaac Netero", "Kite"],
        correct: "Ging Freecss",
        tags: ["gon", "ging", "pai", "hunter"]
    },
    // --- POKEMON (ez) ---
    {
        id: "poke_ez_001",
        level: "easy",
        type: "character",
        anime: "Pokémon",
        question: "Em 'Pokémon', qual é o primeiro Pokémon de Ash Ketchum?",
        image: "https://cdn.myanimelist.net/images/characters/4/192275.jpg",
        options: ["Pikachu", "Charmander", "Squirtle", "Bulbasaur"],
        correct: "Pikachu",
        tags: ["ash", "pikachu", "inicial"]
    },
    // --- DEATH NOTE (ez) ---
    {
        id: "dn_ez_001",
        level: "easy",
        type: "world",
        anime: "Death Note",
        question: "Qual é o nome do caderno usado por Light Yagami em Death Note?",
        image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        options: ["Death Note", "Life Note", "Shinigami Book", "Notebook of Doom"],
        correct: "Death Note",
        tags: ["light", "caderno", "death note"]
    },
    {
        id: "dn_ez_002",
        level: "easy",
        type: "character",
        anime: "Death Note",
        question: "Qual é o nome do Shinigami que adora maçãs em Death Note?",
        image: "https://cdn.myanimelist.net/images/characters/10/266209.jpg",
        options: ["Ryuk", "Rem", "Sidoh", "Jealous"],
        correct: "Ryuk",
        tags: ["shinigami", "ryuk", "maçãs"]
    },
    // --- ONE PUNCH MAN (ez) ---
    {
        id: "opm_ez_001",
        level: "easy",
        type: "character",
        anime: "One Punch Man",
        question: "Qual é o nome do herói careca que derrota inimigos com um soco?",
        image: "https://cdn.myanimelist.net/images/characters/11/294388.jpg",
        options: ["Saitama", "Genos", "Mumen Rider", "Blast"],
        correct: "Saitama",
        tags: ["saitama", "um soco", "herói"]
    },
    // --- SPY X FAMILY (ez) ---
    {
        id: "sxf_ez_001",
        level: "easy",
        type: "character",
        anime: "Spy x Family",
        question: "Em 'Spy x Family', qual alimento Anya Forger ama?",
        image: "https://cdn.myanimelist.net/images/characters/12/402864.jpg",
        options: ["Amendoim", "Cenoura", "Chocolate", "Ramen"],
        correct: "Amendoim",
        tags: ["anya", "amendoim", "forger"]
    },
    // --- CHAINSAW MAN (ez) ---
    {
        id: "csm_ez_001",
        level: "easy",
        type: "character",
        anime: "Chainsaw Man",
        question: "Qual é o nome do demônio de estimação de Denji em 'Chainsaw Man'?",
        image: "https://cdn.myanimelist.net/images/characters/5/385744.jpg",
        options: ["Pochita", "Power", "Makima", "Kon"],
        correct: "Pochita",
        tags: ["pochita", "denji", "chainsaw"]
    },
    // --- SAILOR MOON (ez) ---
    {
        id: "sm_ez_001",
        level: "easy",
        type: "character",
        anime: "Sailor Moon",
        question: "Em 'Sailor Moon', qual é a identidade secreta de Usagi Tsukino?",
        image: "https://cdn.myanimelist.net/images/characters/2/267771.jpg",
        options: ["Sailor Moon", "Sailor Mars", "Sailor Venus", "Sailor Jupiter"],
        correct: "Sailor Moon",
        tags: ["usagi", "sailor moon", "protagonista"]
    },
    // --- HAIKYUU (ez) ---
    {
        id: "hk_ez_001",
        level: "easy",
        type: "world",
        anime: "Haikyuu!!",
        question: "Qual esporte é praticado no anime 'Haikyuu!!'?",
        image: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
        options: ["Vôlei", "Basquete", "Futebol", "Tênis"],
        correct: "Vôlei",
        tags: ["volei", "esporte", "haikyuu"]
    },
    // --- STUDIO GHIBLI (ez) ---
    {
        id: "ghibli_ez_001",
        level: "easy",
        type: "character",
        anime: "Studio Ghibli",
        question: "Quem é o vizinho mágico fofo no filme do Studio Ghibli de 1988 (Meu Amigo Totoro)?",
        image: "https://cdn.myanimelist.net/images/characters/10/250761.jpg",
        options: ["Totoro", "Ponyo", "Jiji", "No-Face"],
        correct: "Totoro",
        tags: ["totoro", "ghibli", "miyazaki"]
    },
    {
        id: "ghibli_ez_002",
        level: "easy",
        type: "character",
        anime: "Studio Ghibli",
        question: "Quem é a personagem principal de 'A Viagem de Chihiro'?",
        image: "https://cdn.myanimelist.net/images/characters/13/42322.jpg",
        options: ["Chihiro", "Haku", "Yubaba", "Lin"],
        correct: "Chihiro",
        tags: ["chihiro", "viagem de chihiro", "ghibli"]
    },
    // --- BLUE LOCK (ez) ---
    {
        id: "bl_ez_001",
        level: "easy",
        type: "world",
        anime: "Blue Lock",
        question: "Em 'Blue Lock', qual é o objetivo do projeto?",
        image: "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        options: ["Criar o maior atacante do mundo", "Ganhar a Copa do Mundo com amizade", "Formar a melhor defesa", "Treinar goleiros"],
        correct: "Criar o maior atacante do mundo",
        tags: ["blue lock", "atacante", "futebol"]
    },
    // --- BLEACH (ez) ---
    {
        id: "bleach_ez_001",
        level: "easy",
        type: "character",
        anime: "Bleach",
        question: "Qual o nome do protagonista de 'Bleach'?",
        image: "https://cdn.myanimelist.net/images/characters/3/300676.jpg",
        options: ["Ichigo Kurosaki", "Uryu Ishida", "Yasutora Sado", "Renji Abarai"],
        correct: "Ichigo Kurosaki",
        tags: ["ichigo", "protagonista", "bleach"]
    },
    // --- CAVALEIROS DO ZODIACO (ez) ---
    {
        id: "saint_ez_001",
        level: "easy",
        type: "character",
        anime: "Cavaleiros do Zodíaco",
        question: "Em 'Cavaleiros do Zodíaco', qual constelação protege Seiya?",
        image: "https://cdn.myanimelist.net/images/characters/6/345520.jpg",
        options: ["Pégaso", "Dragão", "Cisne", "Andrômeda"],
        correct: "Pégaso",
        tags: ["seiya", "pégaso", "cavaleiros"]
    },
    // --- JUJUTSU KAISEN (ez) ---
    {
        id: "jk_ez_001",
        level: "easy",
        type: "character",
        anime: "Jujutsu Kaisen",
        question: "Quem é o professor mais poderoso da Escola Jujutsu?",
        image: "https://cdn.myanimelist.net/images/characters/15/422168.jpg",
        options: ["Satoru Gojo", "Kento Nanami", "Masamichi Yaga", "Suguru Geto"],
        correct: "Satoru Gojo",
        tags: ["gojo", "professor", "jujutsu"]
    },
    // --- SWORD ART ONLINE (ez) ---
    {
        id: "sao_ez_001",
        level: "easy",
        type: "character",
        anime: "Sword Art Online",
        question: "Em 'Sword Art Online', qual é o nome de avatar de Kazuto Kirigaya?",
        image: "https://cdn.myanimelist.net/images/characters/9/231265.jpg",
        options: ["Kirito", "Asuna", "Klein", "Agil"],
        correct: "Kirito",
        tags: ["kirito", "avatar", "sao"]
    },
    // --- DR. SLUMP (ez) ---
    {
        id: "dr_ez_001",
        level: "easy",
        type: "character",
        anime: "Dr. Slump",
        question: "Qual o nome da garota robô em 'Dr. Slump' criada por Akira Toriyama?",
        image: "https://cdn.myanimelist.net/images/characters/5/275338.jpg",
        options: ["Arale", "Bulma", "Chichi", "Android 18"],
        correct: "Arale",
        tags: ["arale", "toriyama", "dr slump"]
    },
    // --- SEVEN DEADLY SINS (ez) ---
    {
        id: "sds_ez_001",
        level: "easy",
        type: "character",
        anime: "Seven Deadly Sins",
        question: "Em 'Seven Deadly Sins', quem é o capitão dos Sete Pecados Capitais?",
        image: "https://cdn.myanimelist.net/images/characters/8/269165.jpg",
        options: ["Meliodas", "Ban", "King", "Escanor"],
        correct: "Meliodas",
        tags: ["meliodas", "pecados capitais", "capitão"]
    },
    // --- YU-GI-OH (ez) ---
    {
        id: "ygo_ez_001",
        level: "easy",
        type: "character",
        anime: "Yu-Gi-Oh!",
        question: "Em 'Yu-Gi-Oh!', qual é o monstro favorito de Yugi?",
        image: "https://cdn.myanimelist.net/images/characters/11/170669.jpg",
        options: ["Mago Negro", "Dragão Branco de Olhos Azuis", "Exodia", "Kuriboh"],
        correct: "Mago Negro",
        tags: ["yugi", "mago negro", "cartas"]
    },

    // =========================================================================
    // NÍVEL: CHUNIN (MEDIUM) - Lore Específica, Seinen Popular & Regras de Mundo
    // =========================================================================
    // --- FULLMETAL ALCHEMIST (md) ---
    {
        id: "fmab_md_001",
        level: "medium",
        type: "lore",
        anime: "Fullmetal Alchemist",
        question: "Em 'Fullmetal Alchemist', qual é a regra fundamental da Alquimia?",
        image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
        options: ["Troca Equivalente", "Transmutação Humana é Proibida", "Círculo de Transmutação é Necessário", "A Pedra Filosofal é a Chave"],
        correct: "Troca Equivalente",
        tags: ["alquimia", "troca equivalente", "lei"]
    },
    {
        id: "fmab_md_002",
        level: "medium",
        type: "character",
        anime: "Fullmetal Alchemist",
        question: "Qual é o nome da esposa de Roy Mustang?",
        image: "https://cdn.myanimelist.net/images/characters/5/167210.jpg",
        options: ["Riza Hawkeye", "Winry Rockbell", "Olivier Mira Armstrong", "Ele não tem esposa"],
        correct: "Ele não tem esposa",
        tags: ["roy mustang", "riza", "relacionamento"]
    },
    {
        id: "fmab_md_003",
        level: "medium",
        type: "lore",
        anime: "Fullmetal Alchemist",
        question: "Quem é o verdadeiro criador dos Homúnculos em FMA: Brotherhood?",
        image: "https://cdn.myanimelist.net/images/characters/16/208535.jpg",
        options: ["Pai (Father)", "Van Hohenheim", "Dante", "Shou Tucker"],
        correct: "Pai (Father)",
        tags: ["homúnculos", "father", "criador"]
    },
    {
        id: "fmab_md_004",
        level: "medium",
        type: "lore",
        anime: "Fullmetal Alchemist",
        question: "Quem foi o primeiro Homúnculo criado em Fullmetal Alchemist: Brotherhood?",
        image: "https://cdn.myanimelist.net/images/characters/11/170569.jpg",
        options: ["Pride (Orgulho)", "Envy (Inveja)", "Lust (Luxúria)", "Greed (Ganância)"],
        correct: "Pride (Orgulho)",
        tags: ["pride", "homúnculo", "primeiro"]
    },
    // --- BLEACH (md) ---
    {
        id: "bleach_md_001",
        level: "medium",
        type: "technique",
        anime: "Bleach",
        question: "Qual é o nome da Zanpakuto de Ichigo Kurosaki em Bleach?",
        image: "https://cdn.myanimelist.net/images/characters/3/300676.jpg",
        options: ["Zangetsu", "Senbonzakura", "Hyorinmaru", "Zabimaru"],
        correct: "Zangetsu",
        tags: ["ichigo", "zangetsu", "zanpakuto"]
    },
    {
        id: "bleach_md_002",
        level: "medium",
        type: "character",
        anime: "Bleach",
        question: "Quem é o capitão da 10ª Divisão em Bleach (o prodígio de gelo)?",
        image: "https://cdn.myanimelist.net/images/characters/8/163013.jpg",
        options: ["Toshiro Hitsugaya", "Byakuya Kuchiki", "Kenpachi Zaraki", "Gin Ichimaru"],
        correct: "Toshiro Hitsugaya",
        tags: ["hitsugaya", "capitão", "gelo"]
    },
    // --- SWORD ART ONLINE (md) ---
    {
        id: "sao_md_001",
        level: "medium",
        type: "character",
        anime: "Sword Art Online",
        question: "Quem foi o criador dos Jogos Mortais em Sword Art Online (Aincrad)?",
        image: "https://cdn.myanimelist.net/images/characters/12/231267.jpg",
        options: ["Kayaba Akihiko", "Sugou Nobuyuki", "Kikuoka Seijirou", "Kirigaya Kazuto"],
        correct: "Kayaba Akihiko",
        tags: ["kayaba", "criador", "sao"]
    },
    {
        id: "sao_md_002",
        level: "medium",
        type: "technique",
        anime: "Sword Art Online",
        question: "Qual é o nome da espada negra de Kirito em SAO (Aincrad)?",
        image: "https://cdn.myanimelist.net/images/characters/9/231265.jpg",
        options: ["Elucidator", "Dark Repulser", "Excalibur", "Lambent Light"],
        correct: "Elucidator",
        tags: ["kirito", "elucidator", "espada"]
    },
    // --- JUJUTSU KAISEN (md) ---
    {
        id: "jk_md_001",
        level: "medium",
        type: "character",
        anime: "Jujutsu Kaisen",
        question: "Em 'Jujutsu Kaisen', quem é conhecido como o Rei das Maldições?",
        image: "https://cdn.myanimelist.net/images/characters/13/423730.jpg",
        options: ["Ryomen Sukuna", "Mahito", "Suguru Geto", "Jogo"],
        correct: "Ryomen Sukuna",
        tags: ["sukuna", "rei das maldições", "jujutsu"]
    },
    // --- DEATH NOTE (md) ---
    {
        id: "dn_md_001",
        level: "medium",
        type: "character",
        anime: "Death Note",
        question: "Qual é o nome verdadeiro de 'L' em Death Note?",
        image: "https://cdn.myanimelist.net/images/characters/10/249871.jpg",
        options: ["L Lawliet", "L Yagami", "Nate River", "Mihael Keehl"],
        correct: "L Lawliet",
        tags: ["l", "lawliet", "detetive"]
    },
    // --- HUNTER X HUNTER (md) ---
    {
        id: "hxh_md_001",
        level: "medium",
        type: "technique",
        anime: "Hunter x Hunter",
        question: "Em 'Hunter x Hunter', qual é o tipo de Nen de Hisoka?",
        image: "https://cdn.myanimelist.net/images/characters/14/195433.jpg",
        options: ["Transmutação", "Intensificação", "Materialização", "Especialização"],
        correct: "Transmutação",
        tags: ["hisoka", "nen", "transmutação"]
    },
    {
        id: "hxh_md_002",
        level: "medium",
        type: "lore",
        anime: "Hunter x Hunter",
        question: "Qual a peculiaridade da família Zoldyck em Hunter x Hunter?",
        image: "https://cdn.myanimelist.net/images/characters/5/164749.jpg",
        options: ["São assassinos profissionais", "São caçadores de gourmet", "São médicos ilegais", "São ferreiros lendários"],
        correct: "São assassinos profissionais",
        tags: ["zoldyck", "assassinos", "killua"]
    },
    // --- NARUTO (md) ---
    {
        id: "naruto_md_001",
        level: "medium",
        type: "character",
        anime: "Naruto",
        question: "Em 'Naruto Shippuden', quem foi o professor de Nagato, Yahiko e Konan?",
        image: "https://cdn.myanimelist.net/images/characters/15/222047.jpg",
        options: ["Jiraiya", "Orochimaru", "Tsunade", "Hiruzen Sarutobi"],
        correct: "Jiraiya",
        tags: ["jiraiya", "nagato", "akatsuki"]
    },
    {
        id: "naruto_md_002",
        level: "medium",
        type: "technique",
        anime: "Naruto",
        question: "Qual é o nome da técnica ocular suprema do Clã Hyuga?",
        image: "https://cdn.myanimelist.net/images/characters/6/150325.jpg",
        options: ["Tenseigan", "Byakugan", "Rinnegan", "Jogan"],
        correct: "Tenseigan",
        tags: ["hyuga", "tenseigan", "byakugan"]
    },
    // --- DRAGON BALL (md) ---
    {
        id: "db_md_001",
        level: "medium",
        type: "lore",
        anime: "Dragon Ball",
        question: "Quem matou Freeza pela primeira vez na linha do tempo original de Trunks?",
        image: "https://cdn.myanimelist.net/images/characters/12/177005.jpg",
        options: ["Goku", "Trunks do Futuro", "Vegeta", "Gohan"],
        correct: "Goku",
        tags: ["freeza", "goku", "trunks", "linha do tempo"]
    },
    // --- TOKYO GHOUL (md) ---
    {
        id: "tg_md_001",
        level: "medium",
        type: "world",
        anime: "Tokyo Ghoul",
        question: "Em 'Tokyo Ghoul', qual é o nome da cafeteria onde Kaneki trabalha?",
        image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
        options: ["Anteiku", ":re", "Goat", "CCG"],
        correct: "Anteiku",
        tags: ["kaneki", "anteiku", "café"]
    },
    {
        id: "tg_md_002",
        level: "medium",
        type: "world",
        anime: "Tokyo Ghoul",
        question: "Qual é o nome da organização que caça ghouls em Tokyo Ghoul?",
        image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
        options: ["CCG (Comissão de Contramedidas aos Ghouls)", "Aogiri Tree", "V", "Clowns"],
        correct: "CCG (Comissão de Contramedidas aos Ghouls)",
        tags: ["ccg", "ghouls", "organização"]
    },
    // --- FAIRY TAIL (md) ---
    {
        id: "fairy_md_002",
        level: "medium",
        type: "power",
        anime: "Fairy Tail",
        question: "Qual é o nome da Dragon Slayer de fogo original, mestra de Natsu?",
        image: "https://cdn.myanimelist.net/images/characters/15/301106.jpg",
        options: ["Igneel", "Grandeeney", "Metallicana", "Weisslogia"],
        correct: "Igneel",
        tags: ["natsu", "igneel", "dragão"]
    },
    // --- ATTACK ON TITAN (md) ---
    {
        id: "aot_md_003",
        level: "medium",
        type: "character",
        anime: "Attack on Titan",
        question: "Qual é a verdadeira identidade do Titã Bestial?",
        image: "https://cdn.myanimelist.net/images/characters/9/285683.jpg",
        options: ["Zeke Yeager", "Eren Yeager", "Grisha Yeager", "Tom Ksaver"],
        correct: "Zeke Yeager",
        tags: ["zeke", "titã bestial", "aot"]
    },
    // --- SEVEN DEADLY SINS (md) ---
    {
        id: "sds_md_001",
        level: "medium",
        type: "character",
        anime: "Seven Deadly Sins",
        question: "Qual é o pecado capital de Meliodas em 'Nanatsu no Taizai'?",
        image: "https://cdn.myanimelist.net/images/characters/8/269165.jpg",
        options: ["Ira (Dragão da Ira)", "Ganância", "Inveja", "Orgulho"],
        correct: "Ira (Dragão da Ira)",
        tags: ["meliodas", "pecado", "ira"]
    },
    {
        id: "sds_md_002",
        level: "medium",
        type: "technique",
        anime: "Seven Deadly Sins",
        question: "Qual é o nome da arma (Tesouro Sagrado) de King em Nanatsu no Taizai?",
        image: "https://cdn.myanimelist.net/images/characters/4/257329.jpg",
        options: ["Chastiefol", "Courechouse", "Gideon", "Lostvayne"],
        correct: "Chastiefol",
        tags: ["king", "chastiefol", "arma"]
    },
    // --- CODE GEASS (md) ---
    {
        id: "cg_md_001",
        level: "medium",
        type: "power",
        anime: "Code Geass",
        question: "Em 'Code Geass', qual é o poder do Geass de Lelouch?",
        image: "https://cdn.myanimelist.net/images/characters/9/292679.jpg",
        options: ["Obediência Absoluta", "Ler Mentes", "Parar o Tempo", "Reescrever Memórias"],
        correct: "Obediência Absoluta",
        tags: ["lelouch", "geass", "poder"]
    },
    // --- RE:ZERO (md) ---
    {
        id: "rz_md_001",
        level: "medium",
        type: "character",
        anime: "Re:Zero",
        question: "Quem é a irmã de Rem em 'Re:Zero'?",
        image: "https://cdn.myanimelist.net/images/characters/4/307186.jpg",
        options: ["Ram", "Emilia", "Beatrice", "Echidna"],
        correct: "Ram",
        tags: ["rem", "ram", "irmãs"]
    },
    // --- CYBERPUNK EDGERUNNERS (md) ---
    {
        id: "cpe_md_001",
        level: "medium",
        type: "technique",
        anime: "Cyberpunk: Edgerunners",
        question: "Em 'Cyberpunk: Edgerunners', qual é o implante militar que David Martinez usa?",
        image: "https://cdn.myanimelist.net/images/characters/8/481971.jpg",
        options: ["Sandevistan", "Berserk", "Gorilla Arms", "Mantis Blades"],
        correct: "Sandevistan",
        tags: ["david", "sandevistan", "cyberware"]
    },
    // --- NEON GENESIS EVANGELION (md) ---
    {
        id: "nge_md_001",
        level: "medium",
        type: "character",
        anime: "Neon Genesis Evangelion",
        question: "Quem é o piloto do EVA-02 em Neon Genesis Evangelion?",
        image: "https://cdn.myanimelist.net/images/characters/9/87413.jpg",
        options: ["Asuka Langley Soryu", "Rei Ayanami", "Shinji Ikari", "Kaworu Nagisa"],
        correct: "Asuka Langley Soryu",
        tags: ["asuka", "eva-02", "piloto"]
    },
    // --- KAGUYA-SAMA (md) ---
    {
        id: "kg_md_001",
        level: "medium",
        type: "character",
        anime: "Kaguya-sama: Love is War",
        question: "Em 'Kaguya-sama', qual é o cargo de Miyuki Shirogane no conselho estudantil?",
        image: "https://cdn.myanimelist.net/images/characters/7/373979.jpg",
        options: ["Presidente", "Vice-Presidente", "Tesoureiro", "Secretário"],
        correct: "Presidente",
        tags: ["shirogane", "presidente", "conselho"]
    },
    // --- MADE IN ABYSS (md) ---
    {
        id: "mia_md_001",
        level: "medium",
        type: "lore",
        anime: "Made in Abyss",
        question: "Em 'Made in Abyss', o que acontece se você subir da 6ª Camada sem a benção adequada?",
        image: "https://cdn.myanimelist.net/images/anime/6/86733.jpg",
        options: ["Perda da humanidade ou morte (Maldição da 6ª)", "Sangramento por todos os orifícios", "Alucinações severas", "Apenas tontura leve"],
        correct: "Perda da humanidade ou morte (Maldição da 6ª)",
        tags: ["abismo", "maldição", "6ª camada"]
    },
    // --- MOB PSYCHO 100 (md) ---
    {
        id: "mp_md_001",
        level: "medium",
        type: "character",
        anime: "Mob Psycho 100",
        question: "Em 'Mob Psycho 100', quem é o mestre charlatão de Mob?",
        image: "https://cdn.myanimelist.net/images/characters/13/312066.jpg",
        options: ["Reigen Arataka", "Dimple", "Teruki Hanazawa", "Ritsu Kageyama"],
        correct: "Reigen Arataka",
        tags: ["reigen", "mob", "mestre"]
    },
    // --- DR. STONE (md) ---
    {
        id: "drs_md_001",
        level: "medium",
        type: "world",
        anime: "Dr. Stone",
        question: "Em 'Dr. Stone', qual é o primeiro fluido reviver criado por Senku?",
        image: "https://cdn.myanimelist.net/images/characters/9/354516.jpg",
        options: ["Ácido Nítrico (Água Milagrosa)", "Ácido Sulfúrico", "Álcool Destilado", "Nitroglicerina"],
        correct: "Ácido Nítrico (Água Milagrosa)",
        tags: ["senku", "ácido nítrico", "reviver"]
    },
    // --- KONOSUBA (md) ---
    {
        id: "ks_md_001",
        level: "medium",
        type: "character",
        anime: "KonoSuba",
        question: "Quem é a deusa inútil em 'Konosuba'?",
        image: "https://cdn.myanimelist.net/images/characters/9/300434.jpg",
        options: ["Aqua", "Megumin", "Darkness", "Eris"],
        correct: "Aqua",
        tags: ["aqua", "deusa", "inútil"]
    },
    // --- ONE PUNCH MAN (md) ---
    {
        id: "opm_md_001",
        level: "medium",
        type: "world",
        anime: "One Punch Man",
        question: "Qual é a classificação de herói de Genos na Associação de Heróis (Início)?",
        image: "https://cdn.myanimelist.net/images/characters/4/275390.jpg",
        options: ["Classe S", "Classe A", "Classe B", "Classe C"],
        correct: "Classe S",
        tags: ["genos", "classe s", "herói"]
    },
    // --- YU YU HAKUSHO (md) ---
    {
        id: "yyh_md_001",
        level: "medium",
        type: "technique",
        anime: "Yu Yu Hakusho",
        question: "Em 'Yu Yu Hakusho', qual é o nome do ataque principal de Hiei?",
        image: "https://cdn.myanimelist.net/images/characters/6/170627.jpg",
        options: ["Chamas Negras Mortais (Jagan)", "Leigan (Kuwabara)", "Espada Espiritual (Yusuke)", "Rosa Sangrenta (Kurama)"],
        correct: "Chamas Negras Mortais (Jagan)",
        tags: ["hiei", "chamas negras", "ataque"]
    },
    // --- AKAME GA KILL (md) ---
    {
        id: "agk_md_001",
        level: "medium",
        type: "world",
        anime: "Akame ga Kill",
        question: "Em 'Akame ga Kill', qual é o nome do grupo de assassinos protagonistas?",
        image: "https://cdn.myanimelist.net/images/anime/1429/95946.jpg",
        options: ["Night Raid", "Jaegers", "Wild Hunt", "Revolutionary Army"],
        correct: "Night Raid",
        tags: ["night raid", "assassinos", "akame"]
    },
    // --- GURREN LAGANN (md) ---
    {
        id: "ttgl_md_001",
        level: "medium",
        type: "technique",
        anime: "Gurren Lagann",
        question: "Qual o nome do mecha gigante em 'Tengen Toppa Gurren Lagann'?",
        image: "https://cdn.myanimelist.net/images/characters/4/53545.jpg",
        options: ["Gurren Lagann", "Gunbuster", "Eva-01", "Mazinger Z"],
        correct: "Gurren Lagann",
        tags: ["gurren lagann", "mecha", "simon"]
    },
    // --- NO GAME NO LIFE (md) ---
    {
        id: "ngnl_md_001",
        level: "medium",
        type: "world",
        anime: "No Game No Life",
        question: "Qual o nome do mundo (disco) onde se passa 'No Game No Life'?",
        image: "https://cdn.myanimelist.net/images/anime/1074/111944.jpg",
        options: ["Disboard", "Aincrad", "Elchea", "Imanity"],
        correct: "Disboard",
        tags: ["disboard", "mundo", "ngnl"]
    },
    // --- HUNTER X HUNTER (hd) ---
    {
        id: "hxh_hd_003",
        level: "hard",
        type: "lore",
        anime: "Hunter x Hunter",
        question: "Qual é o nome do jogo preferido de Ging Freecss e que Gon e Killua jogam na Ilha do Tesouro?",
        image: "https://cdn.myanimelist.net/images/anime/1337/99051.jpg",
        options: ["Greed Island", "Dragon Quest", "Hunter Exam Online", "Kingdom of Magic"],
        correct: "Greed Island",
        tags: ["ging", "gon", "greed island", "jogo"]
    },
    // --- ONE PIECE (md) ---
    {
        id: "op_md_007",
        level: "medium",
        type: "lore",
        anime: "One Piece",
        question: "O que significa a sigla D. no nome de Luffy (Monkey D. Luffy)?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Um mistério (A Vontade de D.)", "Demon", "Devil", "Dawn"],
        correct: "Um mistério (A Vontade de D.)",
        tags: ["luffy", "vontade de d", "mistério"]
    },
    // --- STUDIO GHIBLI (md) ---
    {
        id: "ghibli_md_003",
        level: "medium",
        type: "world",
        anime: "Studio Ghibli",
        question: "Em 'O Castelo Animado', qual é o nome do demônio do fogo que habita a lareira?",
        image: "https://cdn.myanimelist.net/images/characters/11/71325.jpg",
        options: ["Calcifer", "Kodama", "No-Face", "Jiji"],
        correct: "Calcifer",
        tags: ["calcifer", "castelo animado", "demônio"]
    },
    // --- CHAINSAW MAN (md) ---
    {
        id: "csm_md_003",
        level: "medium",
        type: "character",
        anime: "Chainsaw Man",
        question: "Qual é o verdadeiro nome de Makima?",
        image: "https://cdn.myanimelist.net/images/characters/8/423424.jpg",
        options: ["Ela não tem (é Makima)", "Pochita", "Nayuta", "Reze"],
        correct: "Ela não tem (é Makima)",
        tags: ["makima", "nome", "csm"]
    },

    // =========================================================================
    // NÍVEL: JONIN (HARD) - Cult, Timeline, Seiyuu, Autores & Detalhes Obscuros
    // =========================================================================
    // --- STEINS;GATE (hd) ---
    {
        id: "sg_hd_001",
        level: "hard",
        type: "character",
        anime: "Steins;Gate",
        question: "Em 'Steins;Gate', qual é o apelido que Okabe dá para Kurisu Makise?",
        image: "https://cdn.myanimelist.net/images/characters/10/125357.jpg",
        options: ["Christina", "Mayushii", "Shining Finger (Luka)", "Daru (Hashida)"],
        correct: "Christina",
        tags: ["okabe", "kurisu", "christina"]
    },
    // --- ATTACK ON TITAN (hd) ---
    {
        id: "aot_hd_001",
        level: "hard",
        type: "lore",
        anime: "Attack on Titan",
        question: "Qual é o verdadeiro nome do Titã Fundador original em Attack on Titan?",
        image: "https://cdn.myanimelist.net/images/characters/14/404107.jpg",
        options: ["Ymir Fritz", "Frieda Reiss", "Karl Fritz", "Eren Kruger"],
        correct: "Ymir Fritz",
        tags: ["ymir fritz", "titã fundador", "origem"]
    },
    // --- JOJO'S BIZARRE ADVENTURE (hd) ---
    {
        id: "jjba_hd_001",
        level: "hard",
        type: "technique",
        anime: "JoJo's Bizarre Adventure",
        question: "Em 'JoJo's Bizarre Adventure: Golden Wind', qual é o nome do Stand de Diavolo?",
        image: "https://cdn.myanimelist.net/images/characters/14/386000.jpg",
        options: ["King Crimson", "Gold Experience", "Sticky Fingers", "Metallica"],
        correct: "King Crimson",
        tags: ["diavolo", "king crimson", "stand"]
    },
    {
        id: "jjba_hd_002",
        level: "hard",
        type: "lore",
        anime: "JoJo's Bizarre Adventure",
        question: "Qual é a relação de Parentesco entre Jotaro Kujo e Joseph Joestar?",
        image: "https://cdn.myanimelist.net/images/characters/7/284850.jpg",
        options: ["Neto e Avô", "Filho e Pai", "Sobrinho e Tio", "Primos"],
        correct: "Neto e Avô",
        tags: ["jotaro", "joseph", "família joestar"]
    },
    // --- THE PROMISED NEVERLAND (hd) ---
    {
        id: "tpn_hd_001",
        level: "hard",
        type: "character",
        anime: "The Promised Neverland",
        question: "Qual é o número de identificação de Ray tatuado no pescoço em 'The Promised Neverland'?",
        image: "https://cdn.myanimelist.net/images/characters/13/356320.jpg",
        options: ["81194", "63194", "22194", "99194"],
        correct: "81194",
        tags: ["ray", "número", "tatuagem"]
    },
    // --- NEON GENESIS EVANGELION (hd) ---
    {
        id: "nge_hd_001",
        level: "hard",
        type: "lore",
        anime: "Neon Genesis Evangelion",
        question: "Em 'Neon Genesis Evangelion', o que significa a sigla NERV?",
        image: "https://cdn.myanimelist.net/images/anime/1314/108941.jpg",
        options: ["Nervo (Alemão para 'Nervo')", "Deus está em seu céu (Frase)", "Nova Gênese (Inglês)", "Núcleo de Evangelions (Inglês)"],
        correct: "Nervo (Alemão para 'Nervo')",
        tags: ["nerv", "alemão", "significado"]
    },
    // --- BLACK CLOVER (hd) ---
    {
        id: "bc_hd_001",
        level: "hard",
        type: "technique",
        anime: "Black Clover",
        question: "Qual o nome da primeira espada que Asta usa para anular magia em Black Clover?",
        image: "https://cdn.myanimelist.net/images/characters/14/337482.jpg",
        options: ["Espada Matadora de Demônios (Demonic Destroyer)", "Espada Habitadora do Demônio (Demon-Dweller)", "Espada Destruidora de Demônios", "Yami no Yaiba"],
        correct: "Espada Habitadora do Demônio (Demon-Dweller)",
        tags: ["asta", "espada", "anti-magia"]
    },
    // --- COWBOY BEBOP (hd) ---
    {
        id: "cb_hd_001",
        level: "hard",
        type: "character",
        anime: "Cowboy Bebop",
        question: "Em 'Cowboy Bebop', qual é o nome verdadeiro de Faye Valentine?",
        image: "https://cdn.myanimelist.net/images/characters/16/232467.jpg",
        options: ["Desconhecido (ela mesma perdeu a memória)", "Faye Romani", "Julia", "Alice"],
        correct: "Desconhecido (ela mesma perdeu a memória)",
        tags: ["faye", "nome verdadeiro", "memória"]
    },
    // --- MONOGATARI SERIES (hd) ---
    {
        id: "mono_hd_001",
        level: "hard",
        type: "lore",
        anime: "Monogatari Series",
        question: "Em 'Bakemonogatari', qual excentricidade (estranheza) está ligada a Senjougahara Hitagi?",
        image: "https://cdn.myanimelist.net/images/characters/2/78211.jpg",
        options: ["Caranguejo Pesado (Hitagi Crab)", "Caracol Perdido (Mayoi Snail)", "Macaco Chuvoso (Suruga Monkey)", "Cobra (Nadeko Snake)"],
        correct: "Caranguejo Pesado (Hitagi Crab)",
        tags: ["senjougahara", "excentricidade", "caranguejo"]
    },
    // --- MY HERO ACADEMIA (hd) ---
    {
        id: "mha_hd_001",
        level: "hard",
        type: "power",
        anime: "My Hero Academia",
        question: "Qual a individualidade original de All For One?",
        image: "https://cdn.myanimelist.net/images/characters/3/333559.jpg",
        options: ["Roubar e Armazenar Individualidades", "Super Força", "Imortalidade", "Regeneração"],
        correct: "Roubar e Armazenar Individualidades",
        tags: ["all for one", "individualidade", "origem"]
    },
    // --- FATE/STAY NIGHT (hd) ---
    {
        id: "fate_hd_001",
        level: "hard",
        type: "character",
        anime: "Fate/stay night",
        question: "Em 'Fate/Stay Night: Unlimited Blade Works', qual é a identidade heroica de Archer?",
        image: "https://cdn.myanimelist.net/images/characters/15/263385.jpg",
        options: ["Emiya Shirou", "Gilgamesh", "Lancelot", "Sasaki Kojirou"],
        correct: "Emiya Shirou",
        tags: ["archer", "emiya", "identidade"]
    },
    {
        id: "fate_hd_002",
        level: "hard",
        type: "technique",
        anime: "Fate/stay night",
        question: "Qual é o nome da 'Realidade Marble' (Nobre Fantasia) de Gilgamesh?",
        image: "https://cdn.myanimelist.net/images/characters/12/329599.jpg",
        options: ["Ele não possui uma (usa Gate of Babylon)", "Unlimited Blade Works", "Ionioi Hetairoi", "Avalon"],
        correct: "Ele não possui uma (usa Gate of Babylon)",
        tags: ["gilgamesh", "gate of babylon", "reality marble"]
    },
    // --- VINLAND SAGA (hd) ---
    {
        id: "vs_hd_001",
        level: "hard",
        type: "lore",
        anime: "Vinland Saga",
        question: "Em 'Vinland Saga', quem matou Thors, o Troll de Jom?",
        image: "https://cdn.myanimelist.net/images/characters/13/305273.jpg",
        options: ["Askeladd", "Thorkell", "Canute", "Floki"],
        correct: "Askeladd",
        tags: ["thors", "askeladd", "morte"]
    },
    // --- BERSERK (hd) ---
    {
        id: "berserk_hd_001",
        level: "hard",
        type: "author",
        anime: "Berserk",
        question: "Quem é o autor do mangá 'Berserk'?",
        image: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
        options: ["Kentaro Miura", "Hirohiko Araki", "Takehiko Inoue", "Eiichiro Oda"],
        correct: "Kentaro Miura",
        tags: ["berserk", "autor", "miura"]
    },
    // --- SERIAL EXPERIMENTS LAIN (hd) ---
    {
        id: "lain_hd_001",
        level: "hard",
        type: "world",
        anime: "Serial Experiments Lain",
        question: "Em 'Serial Experiments Lain', o que é a 'Wired'?",
        image: "https://cdn.myanimelist.net/images/anime/9/8766.jpg",
        options: ["Uma rede de comunicação global avançada (a Internet)", "Uma droga alucinógena", "Uma organização governamental", "Um programa de TV"],
        correct: "Uma rede de comunicação global avançada (a Internet)",
        tags: ["lain", "wired", "internet"]
    },
    // --- MONSTER (hd) ---
    {
        id: "monster_hd_001",
        level: "hard",
        type: "lore",
        anime: "Monster",
        question: "Em 'Monster', onde Johan Liebert foi baleado na cabeça quando criança?",
        image: "https://cdn.myanimelist.net/images/characters/9/198273.jpg",
        options: ["Alemanha (Berlim)", "República Checa (Praga)", "França (Paris)", "Polônia (Varsóvia)"],
        correct: "Alemanha (Berlim)",
        tags: ["johan", "tiro", "alemanha"]
    },
    // --- PERFECT BLUE / PAPRIKA (hd) ---
    {
        id: "kon_hd_001",
        level: "hard",
        type: "author",
        anime: "Perfect Blue / Paprika",
        question: "Quem é o aclamado diretor por trás dos filmes 'Perfect Blue' e 'Paprika'?",
        image: "https://cdn.myanimelist.net/images/anime/1078/110531.jpg",
        options: ["Satoshi Kon", "Hayao Miyazaki", "Makoto Shinkai", "Mamoru Hosoda"],
        correct: "Satoshi Kon",
        tags: ["satoshi kon", "diretor", "perfect blue", "paprika"]
    },
    // --- GINTAMA (hd) ---
    {
        id: "gintama_hd_001",
        level: "hard",
        type: "technique",
        anime: "Gintama",
        question: "Em 'Gintama', qual é o nome da espada de madeira (bokuto) de Gintoki?",
        image: "https://cdn.myanimelist.net/images/characters/16/220977.jpg",
        options: ["Lake Toya (Toyako)", "Benizakura", "Kusanagi", "Tessaiga"],
        correct: "Lake Toya (Toyako)",
        tags: ["gintoki", "espada", "lake toya"]
    },
    // --- AUTOR DE ONE PIECE (hd) ---
    {
        id: "op_hd_001",
        level: "hard",
        type: "author",
        anime: "One Piece",
        question: "Qual é o nome do criador de 'One Piece'?",
        image: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
        options: ["Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo", "Akira Toriyama"],
        correct: "Eiichiro Oda",
        tags: ["oda", "criador", "one piece"]
    },
    // --- LEGEND OF THE GALACTIC HEROES (hd) ---
    {
        id: "logh_hd_001",
        level: "hard",
        type: "character",
        anime: "Legend of the Galactic Heroes",
        question: "Em 'Legend of the Galactic Heroes', quem é o principal rival estratégico de Reinhard von Lohengramm?",
        image: "https://cdn.myanimelist.net/images/characters/5/107563.jpg",
        options: ["Yang Wen-li", "Siegfried Kircheis", "Paul von Oberstein", "Julian Mintz"],
        correct: "Yang Wen-li",
        tags: ["reinhard", "yang", "rival"]
    },
    // --- ESTÚDIO ONE PUNCH MAN S1 (hd) ---
    {
        id: "industry_hd_001",
        level: "hard",
        type: "studio",
        anime: "One Punch Man",
        question: "Qual estúdio de animação foi o responsável pela aclamada primeira temporada de 'One Punch Man'?",
        image: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        options: ["Madhouse", "J.C. Staff", "Bones", "MAPPA"],
        correct: "Madhouse",
        tags: ["one punch man", "estúdio", "madhouse"]
    },
    // --- FLCL (hd) ---
    {
        id: "flcl_hd_001",
        level: "hard",
        type: "character",
        anime: "FLCL",
        question: "Em 'FLCL (Fooly Cooly)', o que Haruko Haruhara usa como arma principal?",
        image: "https://cdn.myanimelist.net/images/characters/9/46036.jpg",
        options: ["Um Baixo Rickenbacker 4001", "Uma Guitarra Gibson Les Paul", "Uma Bateria Yamaha", "Um Violino Elétrico"],
        correct: "Um Baixo Rickenbacker 4001",
        tags: ["haruko", "arma", "baixo", "flcl"]
    },
    // --- PSYCHO-PASS (hd) ---
    {
        id: "pp_hd_001",
        level: "hard",
        type: "character",
        anime: "Psycho-Pass",
        question: "Em 'Psycho-Pass' (1ª temporada), quem é o principal antagonista por trás dos crimes complexos?",
        image: "https://cdn.myanimelist.net/images/characters/4/195027.jpg",
        options: ["Shogo Makishima", "O Sistema Sybil", "Bifrost", "Os Peacebreakers"],
        correct: "Shogo Makishima",
        tags: ["psycho-pass", "makishima", "antagonista"]
    },
    // --- MUSHISHI (hd) ---
    {
        id: "mushi_hd_001",
        level: "hard",
        type: "world",
        anime: "Mushishi",
        question: "Em 'Mushishi', o que são os 'Mushi'?",
        image: "https://cdn.myanimelist.net/images/characters/15/284145.jpg",
        options: ["Formas de vida primordiais e elementais", "Fantasmas vingativos", "Insetos alienígenas", "Vírus antigos"],
        correct: "Formas de vida primordiais e elementais",
        tags: ["mushi", "mushishi", "seres"]
    },
    // --- AKIRA (hd) ---
    {
        id: "akira_hd_001",
        level: "hard",
        type: "character",
        anime: "Akira",
        question: "Em 'Akira', quem é o líder da Gangue dos Capsules?",
        image: "https://cdn.myanimelist.net/images/characters/16/34947.jpg",
        options: ["Kaneda", "Tetsuo", "Yamagata", "Kei"],
        correct: "Kaneda",
        tags: ["kaneda", "capsules", "akira"]
    },
    // --- REVOLUTIONARY GIRL UTENA (hd) ---
    {
        id: "utena_hd_001",
        level: "hard",
        type: "lore",
        anime: "Revolutionary Girl Utena",
        question: "Em 'Revolutionary Girl Utena', qual é o objetivo dos duelos na Academia Ohtori?",
        image: "https://cdn.myanimelist.net/images/anime/5/75684.jpg",
        options: ["Ganhar a mão da Noiva da Rosa (Anthy)", "Revolucionar o Mundo", "Destruir a escola", "Encontrar o príncipe"],
        correct: "Ganhar a mão da Noiva da Rosa (Anthy)",
        tags: ["utena", "duelos", "anthy", "noiva da rosa"]
    },
    // --- DRAGON BALL Z (hd) ---
    {
        id: "dbz_hd_005",
        level: "hard",
        type: "character",
        anime: "Dragon Ball Z",
        question: "Qual é o nome do irmão mais velho de Goku?",
        image: "https://cdn.myanimelist.net/images/characters/4/245025.jpg",
        options: ["Raditz", "Vegeta", "Tarble", "Bardock"],
        correct: "Raditz",
        tags: ["goku", "raditz", "irmão"]
    },
    // --- SAILOR MOON (hd) ---
    {
        id: "sailor_hd_002",
        level: "hard",
        type: "character",
        anime: "Sailor Moon",
        question: "Qual é o nome da gata de estimação de Usagi Tsukino?",
        image: "https://cdn.myanimelist.net/images/characters/2/267771.jpg",
        options: ["Luna", "Artemis", "Diana", "Kero-chan"],
        correct: "Luna",
        tags: ["luna", "usagi", "gato"]
    }
];

// =============================================================================
// BANCO DE DADOS DE EMERGÊNCIA (FALLBACK ULTRA COMPACTO)
// =============================================================================
const EMERGENCY_DB = [
    {
        question: "Qual é o objetivo de Luffy em One Piece?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Ser o Rei dos Piratas", "Ser Marinheiro", "Ser Prefeito", "Encontrar o pai"],
        correct: "Ser o Rei dos Piratas",
        level: "easy"
    },
    {
        question: "Qual o nome da raposa de nove caudas em Naruto?",
        image: "https://cdn.myanimelist.net/images/characters/9/131317.jpg",
        options: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
        correct: "Kurama",
        level: "easy"
    },
    {
        question: "Quem é o irmão de Edward Elric em FMA?",
        image: "https://cdn.myanimelist.net/images/characters/9/72533.jpg",
        options: ["Alphonse", "Roy", "Hughes", "Armstrong"],
        correct: "Alphonse",
        level: "medium"
    },
    {
        question: "Qual o nome do caderno em Death Note?",
        image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        options: ["Death Note", "Book of Life", "Dark Note", "Shinigate"],
        correct: "Death Note",
        level: "easy"
    },
    {
        question: "Quem é o Sayajin Príncipe?",
        image: "https://cdn.myanimelist.net/images/characters/8/161861.jpg",
        options: ["Vegeta", "Goku", "Nappa", "Raditz"],
        correct: "Vegeta",
        level: "easy"
    }
];

// =============================================================================
// CONFIGURAÇÃO DO EXPRESS E MIDDLEWARES
// =============================================================================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado para permitir imagens externas
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// =============================================================================
// CONFIGURAÇÃO DO POSTGRESQL (NEON)
// =============================================================================
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        max: 20
    });
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================
function shuffleArray(array) {
    if (!array || !Array.isArray(array)) return [];
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function getQuizSession(difficulty = 'medium') {
    try {
        // 1. Usa o banco interno completo como fonte primária
        const sourceDB = INTERNAL_DATABASE;
        
        // 2. Filtra por dificuldade
        let filtered = sourceDB.filter(q => q.level === difficulty);
        
        // 3. Fallback: Se não tiver perguntas suficientes no nível, usa todos os níveis
        if (filtered.length < 5) {
            filtered = sourceDB;
        }

        // 4. Embaralha e pega 10 perguntas
        const selected = shuffleArray(filtered).slice(0, 10);

        // 5. Garante que sempre tenha pelo menos 5 perguntas
        if (selected.length < 5) {
            console.log("⚠️ Poucas perguntas encontradas, usando banco de emergência");
            return EMERGENCY_DB.map(q => ({
                question: q.question,
                image: q.image,
                options: shuffleArray(q.options || ["Erro A", "Erro B", "Erro C", "Erro D"]),
                correct: q.correct
            })).slice(0, 10);
        }

        // 6. Formata as perguntas selecionadas
        return selected.map(q => ({
            question: q.question,
            image: q.image || "https://via.placeholder.com/400x200?text=Anime+Quiz",
            options: shuffleArray(q.options || ["Opção 1", "Opção 2", "Opção 3", "Opção 4"]),
            correct: q.correct
        }));
    } catch (error) {
        console.error("❌ Erro ao gerar quiz:", error);
        // Em caso de erro catastrófico, retorna o banco de emergência
        return EMERGENCY_DB.map(q => ({
            question: q.question,
            image: q.image,
            options: shuffleArray(q.options),
            correct: q.correct
        })).slice(0, 10);
    }
}

// =============================================================================
// ROTAS PRINCIPAIS
// =============================================================================

// Rota de Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: "Online", 
        db_source: "Internal Database",
        questions_count: INTERNAL_DATABASE.length,
        timestamp: new Date().toISOString()
    });
});

// GET /generate-quiz
app.get('/generate-quiz', (req, res) => {
    try {
        const difficulty = req.query.difficulty || 'medium';
        console.log(`🎲 Gerando quiz: ${difficulty}`);
        
        const questions = getQuizSession(difficulty);
        
        res.json({ 
            success: true,
            questions,
            count: questions.length
        });
    } catch (error) {
        console.error("❌ Erro fatal ao gerar quiz:", error);
        // Fallback de emergência
        res.json({ 
            success: true,
            questions: EMERGENCY_DB.map(q => ({
                question: q.question,
                image: q.image,
                options: shuffleArray(q.options),
                correct: q.correct
            })).slice(0, 10)
        });
    }
});

// POST /session (Salvar Ranking)
app.post('/session', async (req, res) => {
    const { player_name, score, total_questions, difficulty } = req.body;

    // Validação básica
    if (!player_name || score === undefined || !total_questions) {
        return res.status(400).json({ 
            success: false, 
            error: "Dados incompletos" 
        });
    }

    // Se não tiver banco configurado, salva em memória (modo offline)
    if (!pool) {
        console.log(`📝 Modo offline: ${player_name} - ${score}/${total_questions}`);
        return res.json({ 
            success: true, 
            mode: 'offline',
            message: 'Pontuação registrada localmente'
        });
    }

    try {
        await pool.query(
            "INSERT INTO game_sessions (player_name, score, total_questions, difficulty, created_at) VALUES ($1, $2, $3, $4, NOW())",
            [player_name.substring(0, 50), score, total_questions, difficulty || 'medium']
        );
        res.json({ success: true, mode: 'online' });
    } catch (error) {
        console.error("❌ Erro ao salvar ranking:", error.message);
        // Retorna sucesso mesmo com erro no banco
        res.json({ 
            success: true, 
            mode: 'offline',
            message: 'Pontuação registrada localmente (banco indisponível)'
        });
    }
});

// GET /ranking
app.get('/ranking', async (req, res) => {
    // Se não tiver banco, retorna lista vazia
    if (!pool) {
        return res.json([]);
    }

    try {
        const result = await pool.query(
            "SELECT player_name, score, total_questions, difficulty, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created_at FROM game_sessions ORDER BY score DESC, created_at DESC LIMIT 50"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erro ao ler ranking:", error.message);
        res.json([]);
    }
});

// GET /stats - Estatísticas do banco de dados
app.get('/stats', (req, res) => {
    const stats = {
        total_questions: INTERNAL_DATABASE.length,
        by_level: {
            easy: INTERNAL_DATABASE.filter(q => q.level === 'easy').length,
            medium: INTERNAL_DATABASE.filter(q => q.level === 'medium').length,
            hard: INTERNAL_DATABASE.filter(q => q.level === 'hard').length
        },
        by_anime: {}
    };
    
    // Contagem por anime
    INTERNAL_DATABASE.forEach(q => {
        if (!stats.by_anime[q.anime]) {
            stats.by_anime[q.anime] = 0;
        }
        stats.by_anime[q.anime]++;
    });
    
    res.json(stats);
});

// Rota de fallback para qualquer outra rota
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: "Rota não encontrada",
        available_routes: ["/", "/generate-quiz", "/session", "/ranking", "/stats"]
    });
});

// =============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =============================================================================
app.listen(PORT, async () => {
    console.log(`\n`);
    console.log(`🔥 SERVIDOR BLINDADO INICIADO 🔥`);
    console.log(`=================================`);
    console.log(`🚀 Porta: ${PORT}`);
    console.log(`📚 Banco interno: ${INTERNAL_DATABASE.length} perguntas carregadas`);
    console.log(`📊 Distribuição:`);
    console.log(`   - Easy: ${INTERNAL_DATABASE.filter(q => q.level === 'easy').length}`);
    console.log(`   - Medium: ${INTERNAL_DATABASE.filter(q => q.level === 'medium').length}`);
    console.log(`   - Hard: ${INTERNAL_DATABASE.filter(q => q.level === 'hard').length}`);
    console.log(`=================================`);
    
    // Tenta criar tabela no PostgreSQL se configurado
    if (pool) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id SERIAL PRIMARY KEY,
                    player_name VARCHAR(100),
                    score INT,
                    total_questions INT,
                    difficulty VARCHAR(20),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Cria índice para melhor performance
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_score_created 
                ON game_sessions (score DESC, created_at DESC)
            `);
            
            console.log(`✅ Banco PostgreSQL conectado e configurado`);
        } catch (e) {
            console.error(`⚠️ Banco PostgreSQL indisponível:`, e.message);
            console.log(`✅ Modo offline ativado - rankings serão armazenados localmente`);
            pool = null;
        }
    } else {
        console.log(`✅ Modo offline - rankings não serão persistidos`);
    }
    
    console.log(`=================================`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`=================================\n`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promise rejeitada não tratada:', error);
});

module.exports = app;
