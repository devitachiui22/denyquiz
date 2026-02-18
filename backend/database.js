/**
 * DENYQUIZ INTERNAL DATABASE v2.0
 * Release: Production Candidate
 * Curator: Otaku Engineer Lead
 *
 * Estrutura:
 * - level: 'easy' | 'medium' | 'hard'
 * - question: string
 * - image: string (URL direta JPG/PNG - MyAnimeList CDN)
 * - options: [string, string, string, string]
 * - correct: string
 */

const DATABASE = [
    // =========================================================================
    // NÍVEL: GENIN (EASY) - Mainstream, Big 3, Modern Hits & Ghibli
    // =========================================================================
    {
        id: "ez_001",
        level: "easy",
        question: "Qual é o objetivo principal de Monkey D. Luffy?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Ser o Rei dos Piratas", "Encontrar o All Blue", "Destruir a Marinha", "Ser o melhor espadachim"],
        correct: "Ser o Rei dos Piratas"
    },
    {
        id: "ez_002",
        level: "easy",
        question: "Em Naruto, qual Bijuu (Besta com Cauda) vive dentro do protagonista?",
        image: "https://cdn.myanimelist.net/images/characters/9/131317.jpg",
        options: ["Kurama (Nove Caudas)", "Shukaku (Uma Cauda)", "Gyuki (Oito Caudas)", "Matatabi (Duas Caudas)"],
        correct: "Kurama (Nove Caudas)"
    },
    {
        id: "ez_003",
        level: "easy",
        question: "Qual é o nome do caderno usado por Light Yagami em Death Note?",
        image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        options: ["Death Note", "Life Note", "Shinigami Book", "Notebook of Doom"],
        correct: "Death Note"
    },
    {
        id: "ez_004",
        level: "easy",
        question: "Quem é o irmão mais velho de Sasuke Uchiha?",
        image: "https://cdn.myanimelist.net/images/characters/16/208027.jpg",
        options: ["Itachi Uchiha", "Madara Uchiha", "Obito Uchiha", "Shisui Uchiha"],
        correct: "Itachi Uchiha"
    },
    {
        id: "ez_005",
        level: "easy",
        question: "Em Dragon Ball Z, qual é a transformação lendária de Goku contra Freeza?",
        image: "https://cdn.myanimelist.net/images/characters/2/227445.jpg",
        options: ["Super Saiyajin", "Kaioken", "Instinto Superior", "Oozaru"],
        correct: "Super Saiyajin"
    },
    {
        id: "ez_006",
        level: "easy",
        question: "Qual é o nome do herói careca que derrota inimigos com um soco?",
        image: "https://cdn.myanimelist.net/images/characters/11/294388.jpg",
        options: ["Saitama", "Genos", "Mumen Rider", "Blast"],
        correct: "Saitama"
    },
    {
        id: "ez_007",
        level: "easy",
        question: "Em 'Demon Slayer', o que Tanjiro carrega na caixa em suas costas?",
        image: "https://cdn.myanimelist.net/images/characters/4/384382.jpg",
        options: ["Sua irmã Nezuko", "Sua espada", "Suprimentos médicos", "Um demônio capturado"],
        correct: "Sua irmã Nezuko"
    },
    {
        id: "ez_008",
        level: "easy",
        question: "Qual é o nome da guilda de magos protagonizada por Natsu Dragneel?",
        image: "https://cdn.myanimelist.net/images/anime/5/17498.jpg",
        options: ["Fairy Tail", "Sabertooth", "Blue Pegasus", "Lamia Scale"],
        correct: "Fairy Tail"
    },
    {
        id: "ez_009",
        level: "easy",
        question: "Quem é o pai de Gon Freecss em Hunter x Hunter?",
        image: "https://cdn.myanimelist.net/images/characters/11/174365.jpg",
        options: ["Ging Freecss", "Silva Zoldyck", "Isaac Netero", "Kite"],
        correct: "Ging Freecss"
    },
    {
        id: "ez_010",
        level: "easy",
        question: "Em 'Pokémon', qual é o primeiro Pokémon de Ash Ketchum?",
        image: "https://cdn.myanimelist.net/images/characters/4/192275.jpg",
        options: ["Pikachu", "Charmander", "Squirtle", "Bulbasaur"],
        correct: "Pikachu"
    },
    {
        id: "ez_011",
        level: "easy",
        question: "Qual anime apresenta Titãs devoradores de humanos?",
        image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        options: ["Attack on Titan", "Tokyo Ghoul", "Parasyte", "Claymore"],
        correct: "Attack on Titan"
    },
    {
        id: "ez_012",
        level: "easy",
        question: "Qual é o golpe assinatura de Goku?",
        image: "https://cdn.myanimelist.net/images/characters/6/277519.jpg",
        options: ["Kamehameha", "Galick Gun", "Final Flash", "Spirit Gun"],
        correct: "Kamehameha"
    },
    {
        id: "ez_013",
        level: "easy",
        question: "Quem é o mentor de Naruto, Sasuke e Sakura?",
        image: "https://cdn.myanimelist.net/images/characters/2/176707.jpg",
        options: ["Kakashi Hatake", "Jiraiya", "Iruka Umino", "Minato Namikaze"],
        correct: "Kakashi Hatake"
    },
    {
        id: "ez_014",
        level: "easy",
        question: "Em 'Boku no Hero Academia', qual é o poder de Izuku Midoriya?",
        image: "https://cdn.myanimelist.net/images/characters/7/299404.jpg",
        options: ["One For All", "Explosão", "Meio-Quente Meio-Frio", "Endurecimento"],
        correct: "One For All"
    },
    {
        id: "ez_015",
        level: "easy",
        question: "Qual é o nome do Shinigami que adora maçãs em Death Note?",
        image: "https://cdn.myanimelist.net/images/characters/10/266209.jpg",
        options: ["Ryuk", "Rem", "Sidoh", "Jealous"],
        correct: "Ryuk"
    },
    {
        id: "ez_016",
        level: "easy",
        question: "Em 'Spy x Family', qual alimento Anya Forger ama?",
        image: "https://cdn.myanimelist.net/images/characters/12/402864.jpg",
        options: ["Amendoim", "Cenoura", "Chocolate", "Ramen"],
        correct: "Amendoim"
    },
    {
        id: "ez_017",
        level: "easy",
        question: "Qual é o nome do demônio de estimação de Denji em 'Chainsaw Man'?",
        image: "https://cdn.myanimelist.net/images/characters/5/385744.jpg",
        options: ["Pochita", "Power", "Makima", "Kon"],
        correct: "Pochita"
    },
    {
        id: "ez_018",
        level: "easy",
        question: "Em 'Sailor Moon', qual é a identidade secreta de Usagi Tsukino?",
        image: "https://cdn.myanimelist.net/images/characters/2/267771.jpg",
        options: ["Sailor Moon", "Sailor Mars", "Sailor Venus", "Sailor Jupiter"],
        correct: "Sailor Moon"
    },
    {
        id: "ez_019",
        level: "easy",
        question: "Qual esporte é praticado no anime 'Haikyuu!!'?",
        image: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
        options: ["Vôlei", "Basquete", "Futebol", "Tênis"],
        correct: "Vôlei"
    },
    {
        id: "ez_020",
        level: "easy",
        question: "Quem é o vizinho mágico fofo no filme do Studio Ghibli de 1988?",
        image: "https://cdn.myanimelist.net/images/characters/10/250761.jpg",
        options: ["Totoro", "Ponyo", "Jiji", "No-Face"],
        correct: "Totoro"
    },
    {
        id: "ez_021",
        level: "easy",
        question: "Em 'Blue Lock', qual é o objetivo do projeto?",
        image: "https://cdn.myanimelist.net/images/anime/1258/126929.jpg",
        options: ["Criar o maior atacante do mundo", "Ganhar a Copa do Mundo com amizade", "Formar a melhor defesa", "Treinar goleiros"],
        correct: "Criar o maior atacante do mundo"
    },
    {
        id: "ez_022",
        level: "easy",
        question: "Qual o nome do protagonista de 'Bleach'?",
        image: "https://cdn.myanimelist.net/images/characters/3/300676.jpg",
        options: ["Ichigo Kurosaki", "Uryu Ishida", "Yasutora Sado", "Renji Abarai"],
        correct: "Ichigo Kurosaki"
    },
    {
        id: "ez_023",
        level: "easy",
        question: "Em 'Cavaleiros do Zodíaco', qual constelação protege Seiya?",
        image: "https://cdn.myanimelist.net/images/characters/6/345520.jpg",
        options: ["Pégaso", "Dragão", "Cisne", "Andrômeda"],
        correct: "Pégaso"
    },
    {
        id: "ez_024",
        level: "easy",
        question: "Quem é o professor mais poderoso da Escola Jujutsu?",
        image: "https://cdn.myanimelist.net/images/characters/15/422168.jpg",
        options: ["Satoru Gojo", "Kento Nanami", "Masamichi Yaga", "Suguru Geto"],
        correct: "Satoru Gojo"
    },
    {
        id: "ez_025",
        level: "easy",
        question: "Em 'Sword Art Online', qual é o nome de avatar de Kazuto Kirigaya?",
        image: "https://cdn.myanimelist.net/images/characters/9/231265.jpg",
        options: ["Kirito", "Asuna", "Klein", "Agil"],
        correct: "Kirito"
    },
    {
        id: "ez_026",
        level: "easy",
        question: "Qual o nome da garota robô em 'Dr. Slump' criada por Akira Toriyama?",
        image: "https://cdn.myanimelist.net/images/characters/5/275338.jpg",
        options: ["Arale", "Bulma", "Chichi", "Android 18"],
        correct: "Arale"
    },
    {
        id: "ez_027",
        level: "easy",
        question: "Em 'Seven Deadly Sins', quem é o capitão dos Sete Pecados Capitais?",
        image: "https://cdn.myanimelist.net/images/characters/8/269165.jpg",
        options: ["Meliodas", "Ban", "King", "Escanor"],
        correct: "Meliodas"
    },
    {
        id: "ez_028",
        level: "easy",
        question: "Qual anime apresenta um caderno que mata quem tem o nome escrito nele?",
        image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        options: ["Death Note", "Mirai Nikki", "Platinum End", "Code Geass"],
        correct: "Death Note"
    },
    {
        id: "ez_029",
        level: "easy",
        question: "Quem é a personagem principal de 'A Viagem de Chihiro'?",
        image: "https://cdn.myanimelist.net/images/characters/13/42322.jpg",
        options: ["Chihiro", "Haku", "Yubaba", "Lin"],
        correct: "Chihiro"
    },
    {
        id: "ez_030",
        level: "easy",
        question: "Em 'Yu-Gi-Oh!', qual é o monstro favorito de Yugi?",
        image: "https://cdn.myanimelist.net/images/characters/11/170669.jpg",
        options: ["Mago Negro", "Dragão Branco de Olhos Azuis", "Exodia", "Kuriboh"],
        correct: "Mago Negro"
    },

    // =========================================================================
    // NÍVEL: CHUNIN (MEDIUM) - Lore Específica, Seinen Popular & Regras de Mundo
    // =========================================================================
    {
        id: "md_001",
        level: "medium",
        question: "Em 'Fullmetal Alchemist', qual é a regra fundamental da Alquimia?",
        image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
        options: ["Troca Equivalente", "Transmutação Humana", "Círculo de Transmutação", "Pedra Filosofal"],
        correct: "Troca Equivalente"
    },
    {
        id: "md_002",
        level: "medium",
        question: "Qual é o nome da Zanpakuto de Ichigo Kurosaki em Bleach?",
        image: "https://cdn.myanimelist.net/images/characters/3/300676.jpg",
        options: ["Zangetsu", "Senbonzakura", "Hyorinmaru", "Zabimaru"],
        correct: "Zangetsu"
    },
    {
        id: "md_003",
        level: "medium",
        question: "Quem foi o criador dos Jogos Mortais em Sword Art Online (Aincrad)?",
        image: "https://cdn.myanimelist.net/images/characters/12/231267.jpg",
        options: ["Kayaba Akihiko", "Sugou Nobuyuki", "Kikuoka Seijirou", "Kirigaya Kazuto"],
        correct: "Kayaba Akihiko"
    },
    {
        id: "md_004",
        level: "medium",
        question: "Em 'Jujutsu Kaisen', quem é conhecido como o Rei das Maldições?",
        image: "https://cdn.myanimelist.net/images/characters/13/423730.jpg",
        options: ["Ryomen Sukuna", "Mahito", "Suguru Geto", "Jogo"],
        correct: "Ryomen Sukuna"
    },
    {
        id: "md_005",
        level: "medium",
        question: "Qual é o nome verdadeiro de 'L' em Death Note?",
        image: "https://cdn.myanimelist.net/images/characters/10/249871.jpg",
        options: ["L Lawliet", "L Yagami", "Nate River", "Mihael Keehl"],
        correct: "L Lawliet"
    },
    {
        id: "md_006",
        level: "medium",
        question: "Em 'Hunter x Hunter', qual é o tipo de Nen de Hisoka?",
        image: "https://cdn.myanimelist.net/images/characters/14/195433.jpg",
        options: ["Transmutação", "Intensificação", "Materialização", "Especialização"],
        correct: "Transmutação"
    },
    {
        id: "md_007",
        level: "medium",
        question: "Quem é o capitão da 10ª Divisão em Bleach (o prodígio de gelo)?",
        image: "https://cdn.myanimelist.net/images/characters/8/163013.jpg",
        options: ["Toshiro Hitsugaya", "Byakuya Kuchiki", "Kenpachi Zaraki", "Gin Ichimaru"],
        correct: "Toshiro Hitsugaya"
    },
    {
        id: "md_008",
        level: "medium",
        question: "Em 'Naruto Shippuden', quem foi o professor de Nagato, Yahiko e Konan?",
        image: "https://cdn.myanimelist.net/images/characters/15/222047.jpg",
        options: ["Jiraiya", "Orochimaru", "Tsunade", "Hiruzen Sarutobi"],
        correct: "Jiraiya"
    },
    {
        id: "md_009",
        level: "medium",
        question: "Qual anime se passa em um mundo onde jogos decidem tudo (No Game No Life)?",
        image: "https://cdn.myanimelist.net/images/anime/1074/111944.jpg",
        options: ["Disboard", "Aincrad", "Elchea", "Imanity"],
        correct: "Disboard"
    },
    {
        id: "md_010",
        level: "medium",
        question: "Quem matou Freeza pela primeira vez na linha do tempo original de Trunks?",
        image: "https://cdn.myanimelist.net/images/characters/12/177005.jpg",
        options: ["Goku", "Trunks do Futuro", "Vegeta", "Gohan"],
        correct: "Goku"
    },
    {
        id: "md_011",
        level: "medium",
        question: "Em 'Tokyo Ghoul', qual é o nome da cafeteria onde Kaneki trabalha?",
        image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
        options: ["Anteiku", "Re", "Goat", "CCG"],
        correct: "Anteiku"
    },
    {
        id: "md_012",
        level: "medium",
        question: "Qual personagem de 'One Piece' luta usando o estilo Santoryu (Três Espadas)?",
        image: "https://cdn.myanimelist.net/images/characters/3/100534.jpg",
        options: ["Roronoa Zoro", "Dracule Mihawk", "Shanks", "Trafalgar Law"],
        correct: "Roronoa Zoro"
    },
    {
        id: "md_013",
        level: "medium",
        question: "Qual é o pecado capital de Meliodas em 'Nanatsu no Taizai'?",
        image: "https://cdn.myanimelist.net/images/characters/8/269165.jpg",
        options: ["Ira", "Ganância", "Inveja", "Orgulho"],
        correct: "Ira"
    },
    {
        id: "md_014",
        level: "medium",
        question: "Em 'Code Geass', qual é o poder do Geass de Lelouch?",
        image: "https://cdn.myanimelist.net/images/characters/9/292679.jpg",
        options: ["Obediência Absoluta", "Ler Mentes", "Parar o Tempo", "Reescrever Memórias"],
        correct: "Obediência Absoluta"
    },
    {
        id: "md_015",
        level: "medium",
        question: "Quem é a irmã de Rem em 'Re:Zero'?",
        image: "https://cdn.myanimelist.net/images/characters/4/307186.jpg",
        options: ["Ram", "Emilia", "Beatrice", "Echidna"],
        correct: "Ram"
    },
    {
        id: "md_016",
        level: "medium",
        question: "Em 'Cyberpunk: Edgerunners', qual é o implante militar que David Martinez usa?",
        image: "https://cdn.myanimelist.net/images/characters/8/481971.jpg",
        options: ["Sandevistan", "Berserk", "Gorilla Arms", "Mantis Blades"],
        correct: "Sandevistan"
    },
    {
        id: "md_017",
        level: "medium",
        question: "Quem é o piloto do EVA-02 em Neon Genesis Evangelion?",
        image: "https://cdn.myanimelist.net/images/characters/9/87413.jpg",
        options: ["Asuka Langley", "Rei Ayanami", "Shinji Ikari", "Kaworu Nagisa"],
        correct: "Asuka Langley"
    },
    {
        id: "md_018",
        level: "medium",
        question: "Qual é o nome da espada negra de Kirito em SAO (Aincrad)?",
        image: "https://cdn.myanimelist.net/images/characters/9/231265.jpg",
        options: ["Elucidator", "Dark Repulser", "Excalibur", "Lambent Light"],
        correct: "Elucidator"
    },
    {
        id: "md_019",
        level: "medium",
        question: "Em 'Kaguya-sama', qual é o cargo de Miyuki Shirogane?",
        image: "https://cdn.myanimelist.net/images/characters/7/373979.jpg",
        options: ["Presidente", "Vice-Presidente", "Tesoureiro", "Secretário"],
        correct: "Presidente"
    },
    {
        id: "md_020",
        level: "medium",
        question: "Qual a peculiaridade da família Zoldyck em Hunter x Hunter?",
        image: "https://cdn.myanimelist.net/images/characters/5/164749.jpg",
        options: ["São assassinos profissionais", "São caçadores de gourmet", "São médicos ilegais", "São ferreiros lendários"],
        correct: "São assassinos profissionais"
    },
    {
        id: "md_021",
        level: "medium",
        question: "Em 'Made in Abyss', o que acontece se você subir da 6ª Camada?",
        image: "https://cdn.myanimelist.net/images/anime/6/86733.jpg",
        options: ["Perda da humanidade ou morte", "Sangramento por orifícios", "Alucinações severas", "Apenas tontura leve"],
        correct: "Perda da humanidade ou morte"
    },
    {
        id: "md_022",
        level: "medium",
        question: "Quem é o verdadeiro criador dos Homúnculos em FMA: Brotherhood?",
        image: "https://cdn.myanimelist.net/images/characters/16/208535.jpg",
        options: ["Pai (Father)", "Van Hohenheim", "Dante", "Shou Tucker"],
        correct: "Pai (Father)"
    },
    {
        id: "md_023",
        level: "medium",
        question: "Em 'Mob Psycho 100', quem é o mestre charlatão de Mob?",
        image: "https://cdn.myanimelist.net/images/characters/13/312066.jpg",
        options: ["Reigen Arataka", "Dimple", "Teruki Hanazawa", "Ritsu Kageyama"],
        correct: "Reigen Arataka"
    },
    {
        id: "md_024",
        level: "medium",
        question: "Qual é o nome da arma (Tesouro Sagrado) de King em Nanatsu no Taizai?",
        image: "https://cdn.myanimelist.net/images/characters/4/257329.jpg",
        options: ["Chastiefol", "Courechouse", "Gideon", "Lostvayne"],
        correct: "Chastiefol"
    },
    {
        id: "md_025",
        level: "medium",
        question: "Em 'Dr. Stone', qual é o primeiro fluido reviver criado por Senku?",
        image: "https://cdn.myanimelist.net/images/characters/9/354516.jpg",
        options: ["Ácido Nítrico (Água Milagrosa)", "Ácido Sulfúrico", "Álcool Destilado", "Nitroglicerina"],
        correct: "Ácido Nítrico (Água Milagrosa)"
    },
    {
        id: "md_026",
        level: "medium",
        question: "Quem é a deusa inútil em 'Konosuba'?",
        image: "https://cdn.myanimelist.net/images/characters/9/300434.jpg",
        options: ["Aqua", "Megumin", "Darkness", "Eris"],
        correct: "Aqua"
    },
    {
        id: "md_027",
        level: "medium",
        question: "Qual é a classificação de herói de Genos na Associação de Heróis (Início)?",
        image: "https://cdn.myanimelist.net/images/characters/4/275390.jpg",
        options: ["Classe S", "Classe A", "Classe B", "Classe C"],
        correct: "Classe S"
    },
    {
        id: "md_028",
        level: "medium",
        question: "Em 'Yu Yu Hakusho', qual é o nome do ataque principal de Hiei?",
        image: "https://cdn.myanimelist.net/images/characters/6/170627.jpg",
        options: ["Chamas Negras Mortais", "Leigan", "Espada Espiritual", "Rosa Sangrenta"],
        correct: "Chamas Negras Mortais"
    },
    {
        id: "md_029",
        level: "medium",
        question: "Em 'Akame ga Kill', qual é o nome do grupo de assassinos protagonistas?",
        image: "https://cdn.myanimelist.net/images/anime/1429/95946.jpg",
        options: ["Night Raid", "Jaegers", "Wild Hunt", "Revolutionary Army"],
        correct: "Night Raid"
    },
    {
        id: "md_030",
        level: "medium",
        question: "Qual o nome do mecha gigante em 'Tengen Toppa Gurren Lagann'?",
        image: "https://cdn.myanimelist.net/images/characters/4/53545.jpg",
        options: ["Gurren Lagann", "Gunbuster", "Eva-01", "Mazinger Z"],
        correct: "Gurren Lagann"
    },

    // =========================================================================
    // NÍVEL: JONIN (HARD) - Cult, Timeline, Seiyuu, Autores & Detalhes Obscuros
    // =========================================================================
    {
        id: "hd_001",
        level: "hard",
        question: "Em 'Steins;Gate', qual é o apelido que Okabe dá para Kurisu Makise?",
        image: "https://cdn.myanimelist.net/images/characters/10/125357.jpg",
        options: ["Christina", "Mayushii", "Shining Finger", "Daru"],
        correct: "Christina"
    },
    {
        id: "hd_002",
        level: "hard",
        question: "Qual é o verdadeiro nome do Titã Fundador original em Attack on Titan?",
        image: "https://cdn.myanimelist.net/images/characters/14/404107.jpg",
        options: ["Ymir Fritz", "Frieda Reiss", "Karl Fritz", "Eren Kruger"],
        correct: "Ymir Fritz"
    },
    {
        id: "hd_003",
        level: "hard",
        question: "Em 'JoJo's Bizarre Adventure', qual é o nome do Stand de Diavolo?",
        image: "https://cdn.myanimelist.net/images/characters/14/386000.jpg",
        options: ["King Crimson", "Gold Experience", "Sticky Fingers", "Metallica"],
        correct: "King Crimson"
    },
    {
        id: "hd_004",
        level: "hard",
        question: "Qual é o número de identificação de Ray tatuado no pescoço em 'The Promised Neverland'?",
        image: "https://cdn.myanimelist.net/images/characters/13/356320.jpg",
        options: ["81194", "63194", "22194", "99194"],
        correct: "81194"
    },
    {
        id: "hd_005",
        level: "hard",
        question: "Em 'Neon Genesis Evangelion', o que significa a sigla NERV?",
        image: "https://cdn.myanimelist.net/images/anime/1314/108941.jpg",
        options: ["Nervo (Alemão)", "Deus está em seu céu", "Nova Gênese", "Anjo Artificial"],
        correct: "Nervo (Alemão)"
    },
    {
        id: "hd_006",
        level: "hard",
        question: "Qual o nome da espada que Asta usa para anular magia em Black Clover?",
        image: "https://cdn.myanimelist.net/images/characters/14/337482.jpg",
        options: ["Espada Matadora de Demônios", "Espada Habitadora do Demônio", "Espada Destruidora de Demônios", "Yami no Yaiba"],
        correct: "Espada Matadora de Demônios"
    },
    {
        id: "hd_007",
        level: "hard",
        question: "Em 'Cowboy Bebop', qual é o nome verdadeiro de Faye Valentine?",
        image: "https://cdn.myanimelist.net/images/characters/16/232467.jpg",
        options: ["Desconhecido (Perdeu a memória)", "Faye Romani", "Julia", "Alice"],
        correct: "Desconhecido (Perdeu a memória)"
    },
    {
        id: "hd_008",
        level: "hard",
        question: "Quem foi o primeiro Homúnculo criado em Fullmetal Alchemist: Brotherhood?",
        image: "https://cdn.myanimelist.net/images/characters/11/170569.jpg",
        options: ["Pride (Orgulho)", "Envy (Inveja)", "Lust (Luxúria)", "Greed (Ganância)"],
        correct: "Pride (Orgulho)"
    },
    {
        id: "hd_009",
        level: "hard",
        question: "Em 'Monogatari Series', qual excentricidade está ligada a Senjougahara?",
        image: "https://cdn.myanimelist.net/images/characters/2/78211.jpg",
        options: ["Caranguejo Pesado", "Caracol Perdido", "Macaco Chuvoso", "Cobra"],
        correct: "Caranguejo Pesado"
    },
    {
        id: "hd_010",
        level: "hard",
        question: "Qual a individualidade original de All For One?",
        image: "https://cdn.myanimelist.net/images/characters/3/333559.jpg",
        options: ["Roubar Individualidades", "Super Força", "Imortalidade", "Regeneração"],
        correct: "Roubar Individualidades"
    },
    {
        id: "hd_011",
        level: "hard",
        question: "Em 'Fate/Stay Night', qual é a identidade heroica de Archer (Rota UBW)?",
        image: "https://cdn.myanimelist.net/images/characters/15/263385.jpg",
        options: ["Emiya Shirou", "Gilgamesh", "Lancelot", "Sasaki Kojirou"],
        correct: "Emiya Shirou"
    },
    {
        id: "hd_012",
        level: "hard",
        question: "Qual é o nome da organização que caça ghouls em Tokyo Ghoul?",
        image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
        options: ["CCG", "Aogiri Tree", "V", "Clowns"],
        correct: "CCG"
    },
    {
        id: "hd_013",
        level: "hard",
        question: "Em 'Vinland Saga', quem matou Thors, o Troll de Jom?",
        image: "https://cdn.myanimelist.net/images/characters/13/305273.jpg",
        options: ["Askeladd", "Thorkell", "Canute", "Floki"],
        correct: "Askeladd"
    },
    {
        id: "hd_014",
        level: "hard",
        question: "Qual é o nome da técnica ocular suprema do Clã Hyuga?",
        image: "https://cdn.myanimelist.net/images/characters/6/150325.jpg",
        options: ["Tenseigan", "Byakugan Puro", "Rinnegan", "Jogan"],
        correct: "Tenseigan"
    },
    {
        id: "hd_015",
        level: "hard",
        question: "Quem é o autor de 'Berserk'?",
        image: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
        options: ["Kentaro Miura", "Hirohiko Araki", "Takehiko Inoue", "Eiichiro Oda"],
        correct: "Kentaro Miura"
    },
    {
        id: "hd_016",
        level: "hard",
        question: "Em 'Serial Experiments Lain', o que é a 'Wired'?",
        image: "https://cdn.myanimelist.net/images/anime/9/8766.jpg",
        options: ["Uma rede de comunicação avançada (Internet)", "Uma droga alucinógena", "Uma organização governamental", "Um programa de TV"],
        correct: "Uma rede de comunicação avançada (Internet)"
    },
    {
        id: "hd_017",
        level: "hard",
        question: "Qual é o nome da 'Realidade Marble' de Gilgamesh em Fate?",
        image: "https://cdn.myanimelist.net/images/characters/12/329599.jpg",
        options: ["Ele não possui (Gate of Babylon)", "Unlimited Blade Works", "Ionioi Hetairoi", "Avalon"],
        correct: "Ele não possui (Gate of Babylon)"
    },
    {
        id: "hd_018",
        level: "hard",
        question: "Em 'Monster', onde Johan Liebert foi baleado na cabeça quando criança?",
        image: "https://cdn.myanimelist.net/images/characters/9/198273.jpg",
        options: ["Alemanha", "República Checa", "França", "Polônia"],
        correct: "Alemanha"
    },
    {
        id: "hd_019",
        level: "hard",
        question: "Quem dirigiu o filme 'Perfect Blue' e 'Paprika'?",
        image: "https://cdn.myanimelist.net/images/anime/1078/110531.jpg",
        options: ["Satoshi Kon", "Hayao Miyazaki", "Makoto Shinkai", "Mamoru Hosoda"],
        correct: "Satoshi Kon"
    },
    {
        id: "hd_020",
        level: "hard",
        question: "Em 'Gintama', qual é o nome da espada de madeira de Gintoki?",
        image: "https://cdn.myanimelist.net/images/characters/16/220977.jpg",
        options: ["Lake Toya (Toyako)", "Benizakura", "Kusanagi", "Tessaiga"],
        correct: "Lake Toya (Toyako)"
    },
    {
        id: "hd_021",
        level: "hard",
        question: "Qual é o nome do criador de 'One Piece'?",
        image: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
        options: ["Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo", "Akira Toriyama"],
        correct: "Eiichiro Oda"
    },
    {
        id: "hd_022",
        level: "hard",
        question: "Em 'Legend of the Galactic Heroes', quem é o rival estratégico de Reinhard?",
        image: "https://cdn.myanimelist.net/images/characters/5/107563.jpg",
        options: ["Yang Wen-li", "Siegfried Kircheis", "Paul von Oberstein", "Julian Mintz"],
        correct: "Yang Wen-li"
    },
    {
        id: "hd_023",
        level: "hard",
        question: "Qual estúdio animou a primeira temporada de 'One Punch Man'?",
        image: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
        options: ["Madhouse", "J.C. Staff", "Bones", "MAPPA"],
        correct: "Madhouse"
    },
    {
        id: "hd_024",
        level: "hard",
        question: "Em 'FLCL', o que Haruko Haruhara usa como arma principal?",
        image: "https://cdn.myanimelist.net/images/characters/9/46036.jpg",
        options: ["Baixo Rickenbacker 4001", "Guitarra Gibson", "Bateria Yamaha", "Violino Elétrico"],
        correct: "Baixo Rickenbacker 4001"
    },
    {
        id: "hd_025",
        level: "hard",
        question: "Qual o nome da organização vilã em 'Psycho-Pass' Season 1?",
        image: "https://cdn.myanimelist.net/images/characters/4/195027.jpg",
        options: ["Não há organização, é Makishima", "Sybil System", "Bifrost", "Peacebreakers"],
        correct: "Não há organização, é Makishima"
    },
    {
        id: "hd_026",
        level: "hard",
        question: "Em 'Mushishi', o que são os 'Mushi'?",
        image: "https://cdn.myanimelist.net/images/characters/15/284145.jpg",
        options: ["Formas de vida primordiais", "Fantasmas vingativos", "Insetos alienígenas", "Vírus antigos"],
        correct: "Formas de vida primordiais"
    },
    {
        id: "hd_027",
        level: "hard",
        question: "Qual é a relação de Parentesco entre Jotaro Kujo e Joseph Joestar?",
        image: "https://cdn.myanimelist.net/images/characters/7/284850.jpg",
        options: ["Neto e Avô", "Filho e Pai", "Sobrinho e Tio", "Primos"],
        correct: "Neto e Avô"
    },
    {
        id: "hd_028",
        level: "hard",
        question: "Em 'Akira', quem é o líder da Gangue dos Capsules?",
        image: "https://cdn.myanimelist.net/images/characters/16/34947.jpg",
        options: ["Kaneda", "Tetsuo", "Yamagata", "Kei"],
        correct: "Kaneda"
    },
    {
        id: "hd_029",
        level: "hard",
        question: "Qual Light Novel deu origem ao anime 'Bakemonogatari'?",
        image: "https://cdn.myanimelist.net/images/anime/11/75274.jpg",
        options: ["Monogatari Series", "Zaregoto", "Katanagatari", "Rascal Does Not Dream"],
        correct: "Monogatari Series"
    },
    {
        id: "hd_030",
        level: "hard",
        question: "Em 'Revolutionary Girl Utena', qual é o objetivo dos duelos?",
        image: "https://cdn.myanimelist.net/images/anime/5/75684.jpg",
        options: ["Revolucionar o Mundo (Poder de Dios)", "Ganhar a mão da Noiva da Rosa", "Destruir a escola", "Encontrar o príncipe"],
        correct: "Revolucionar o Mundo (Poder de Dios)"
    }
];

module.exports = DATABASE;