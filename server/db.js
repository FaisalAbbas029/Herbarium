import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ==========================================
// DATA PERSISTENCE
// ==========================================
//
// This project stores all of its data (users, specimens, invitations,
// activity logs, contact messages) in one JSON file on disk:
// data/herbarium.json. Every write goes through persist() at the bottom
// of this file, which re-saves the whole file. That means data survives a
// server restart, but this is still a simple, single-file setup meant for
// development/demo use.
//
// For a real production deployment, replace this class with a proper
// database (PostgreSQL, MySQL, MongoDB, etc.) — the public methods below
// (findUserByEmail, createSpecimen, createInvitation, and so on) would
// stay the same, so server.js and the rest of the app would not need to
// change at all.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), "data");
const UPLOADS_DIR = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(process.cwd(), "uploads");
const DB_FILE = path.join(DATA_DIR, "herbarium.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// Sample specimen records used to seed the archive the very first time the
// server runs (when data/herbarium.json does not exist yet). Real
// administrators can add, edit, and delete specimens afterward through the
// admin panel; nothing here is loaded again once the data file exists.
const SEED_BOTANICAL_SPECIMENS = [
  {
    accessionNumber: "SHB-2024-001",
    commonName: "Maidenhair Tree / Living Fossil Ginkgo",
    scientificName: "Ginkgo biloba L.",
    kingdom: "Plantae",
    family: "Ginkgoaceae",
    genus: "Ginkgo",
    species: "biloba",
    morphology: "Dioecious gymnosperm tree reaching 25-35 m in height. Bark deeply furrowed, grayish-brown with corky ridges. Leaves distinctive, fan-shaped with dichotomous venation, bilobed in juvenile shoots, 5-10 cm broad, turning bright saffron yellow in autumn. Pollen cones pendulous catkin-like on spur shoots; ovules paired on slender stalks producing naked seeds with fleshy, butyric-scented sarcotesta.",
    characteristics: "Dichotomous leaf venation without midrib; motile multi-flagellated spermatozoids; deciduous gymnosperm with spur and long shoot dimorphism.",
    description: "A sole surviving relict species of the order Ginkgoales, dating back over 200 million years to the Early Jurassic. Widely preserved in temple gardens of Zhejiang, China, and cultivated globally for extreme resilience to atmospheric pollutants and urban microclimates.",
    habitat: "Temperate deciduous mesophytic forests, rocky mountain valleys, sandstone bluffs, and cultivated botanical grounds.",
    geographicDistribution: "Native to Daloushan Mountains, Zhejiang & Guizhou provinces, Southwestern China; naturalized across East Asia, Europe, and North America.",
    region: "East Asia",
    location: "Tianmu Mountain Reserve, Zhejiang Province",
    latitude: 30.3444,
    longitude: 119.4389,
    collectorName: "Dr. Eleanor Vance & Prof. Chen Wei",
    collectionDate: "2024-04-12",
    collectionLocation: "North ridge trail, 850m elevation, mixed broadleaf forest",
    coordinates: `30\xB020'39.8"N 119\xB026'20.0"E`,
    collectionNotes: "Mature fertile branch with newly emerged microsporangiate strobili and juvenile fan foliage. Bark sample and pressed leaves preserved.",
    conservationStatus: "Endangered",
    traditionalUses: "Seeds (Bai Guo) roasted and consumed in traditional Chinese culinary and ceremonial preparations; leaves dried for vitality teas.",
    medicinalUses: "Standardized leaf extracts (EGb 761) containing terpene lactones (ginkgolides, bilobalide) and flavonoid glycosides used to improve cerebral microcirculation and cognitive function.",
    ecologicalUses: "Exceptional tolerance to sulfur dioxide and urban particulates; mycorrhizal associations with Glomus species; high insect and fungal disease resistance.",
    otherNotes: "Type specimen voucher cross-referenced with Royal Botanic Gardens, Kew collection #K-00084129.",
    status: "PUBLISHED",
    publishedAt: "2024-04-15T09:00:00.000Z",
    photos: [
      {
        id: "photo-ginkgo-1",
        specimenId: "spec-1",
        storageUrl: "https://pixabay.com/images/download/lancier-gingko-5789687_1920.jpg",
        altText: "Pressed herbarium specimen showing dichotomously veined Ginkgo biloba leaves on short shoot",
        caption: "Herbarium voucher sheet: Short shoots with typical fan-shaped bilobed lamina",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-04-14T10:00:00.000Z",
        fileSizeBytes: 420500,
        dimensions: "1600x1200"
      },
      {
        id: "photo-ginkgo-2",
        specimenId: "spec-1",
        storageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=1200&q=80",
        altText: "Golden autumn foliage of Ginkgo biloba canopy",
        caption: "Canopy foliage during peak autumn senescence showing carotenoid pigment expression",
        displayOrder: 1,
        isPrimary: false,
        uploadTimestamp: "2024-04-14T10:05:00.000Z",
        fileSizeBytes: 65e4,
        dimensions: "1920x1080"
      },
      {
        id: "photo-ginkgo-3",
        specimenId: "spec-1",
        storageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
        altText: "Dichotomous venation detail under botanical stereomicroscope",
        caption: "Micrographic view of parallel fork-branching venation without cross-veins",
        displayOrder: 2,
        isPrimary: false,
        uploadTimestamp: "2024-04-14T10:10:00.000Z",
        fileSizeBytes: 512e3,
        dimensions: "1400x1050"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-002",
    commonName: "Common Purple Foxglove",
    scientificName: "Digitalis purpurea L.",
    kingdom: "Plantae",
    family: "Plantaginaceae",
    genus: "Digitalis",
    species: "purpurea",
    morphology: "Biennial or short-lived perennial herb standing 60-180 cm tall. First-year rosette of ovate-lanceolate, rugose, crenate leaves with woolly glandular hairs on underside. Second-year erect unbranched flowering stem bearing a unilateral, terminal raceme of nodding, tubular-campanulate flowers (4-5 cm long). Corolla deep purple-rose with spotted white-ringed interior; four didynamous stamens.",
    characteristics: "Unilateral terminal raceme; spotted throat corolla serving as nectar guide for Bombus pollinators; high concentration of cardiac glycosides digitoxin and digoxin.",
    description: "Classic European woodland and heathland wildflower celebrated for its striking spire of pendulous blossoms and historical pharmaceutical significance in cardiovascular medicine.",
    habitat: "Acidic soils, forest clearings, open woodlands, siliceous screes, hedgerows, and heathland margins.",
    geographicDistribution: "Native across Western, Central, and Southern Europe; naturalized in temperate regions of the Americas and Australasia.",
    region: "Western Europe",
    location: "Black Forest (Schwarzwald), Baden-W\xFCrttemberg, Germany",
    latitude: 48.18,
    longitude: 8.21,
    collectorName: "Sarah Lindqvist & Dr. Aarav Patel",
    collectionDate: "2024-05-28",
    collectionLocation: "Clear-felled pine margin near Titisee, 920m elevation",
    coordinates: `48\xB010'48.0"N 8\xB012'36.0"E`,
    collectionNotes: "Collected at peak anthesis; 18 open flowers on primary raceme. Rosette basal leaf and dissected floral parts mounted.",
    conservationStatus: "Least Concern",
    traditionalUses: "Historical folk use for dropsy (edema); strictly handled due to extreme toxicity of all plant parts.",
    medicinalUses: "Source of cardiac glycosides (digoxin, digitoxin) which inhibit cellular Na+/K+-ATPase, historically prescribed to manage atrial fibrillation and congestive heart failure.",
    ecologicalUses: "Primary bumblebee (Bombus hortorum, Bombus pascuorum) forage source in early summer forest gaps.",
    otherNotes: "Warning: Highly toxic when ingested. Voucher sheet stored in high-security botanical cabinet.",
    status: "PUBLISHED",
    publishedAt: "2024-06-01T14:30:00.000Z",
    photos: []
  },
  {
    accessionNumber: "SHB-2024-003",
    commonName: "Scots Pine",
    scientificName: "Pinus sylvestris L.",
    kingdom: "Plantae",
    family: "Pinaceae",
    genus: "Pinus",
    species: "sylvestris",
    morphology: "Coniferous evergreen tree reaching up to 35 m. Distinctive upper trunk with flaky, bright orange-cinnamon bark; lower trunk dark grayish-brown with scaly fissures. Leaves (needles) arranged in pairs on short shoots, glaucous blue-green, slightly twisted, 3-7 cm long. Seed cones conical, 3-6 cm, maturing from green to dull grayish-brown in second year, scales with small central umbo.",
    characteristics: "Two-needle fascicles; bicolored bark with fiery orange upper crown; winged seed dispersal adapted to boreal wind regimes.",
    description: "The national tree of Scotland and the most widely distributed pine species in the world, spanning the boreal taiga from Scotland to Eastern Siberia.",
    habitat: "Sandy podsols, peat bog margins, rocky montane ridges, and continental boreal forests.",
    geographicDistribution: "Eurasia: from Western Europe (Scotland, Iberian Peninsula) across Fennoscandia and Russia to the Sea of Okhotsk.",
    region: "Northern Europe & Taiga",
    location: "Cairngorms National Park, Scottish Highlands",
    latitude: 57.08,
    longitude: -3.65,
    collectorName: "Dr. Eleanor Vance & Hamish MacLeod",
    collectionDate: "2024-06-15",
    collectionLocation: "Ancient Caledonian Pine forest remnant near Rothiemurchus, 340m",
    coordinates: `57\xB004'48.0"N 3\xB039'00.0"W`,
    collectionNotes: "Branchlet with second-year mature cone and first-year conelet; needle fascicles preserved with resin canal cross-section notes.",
    conservationStatus: "Least Concern",
    traditionalUses: "Resin historically tapped for pine tar, turpentine, and naval stores; timber used for ship masts and traditional stave construction.",
    medicinalUses: "Pine needle essential oil containing alpha-pinene, beta-pinene, and limonene used in respiratory inhalations and antimicrobial topical balms.",
    ecologicalUses: "Keystone canopy species supporting Western capercaillie, red squirrel, Scottish crossbill, and extensive ectomycorrhizal fungal communities (Suillus, Russula).",
    otherNotes: "Tree age estimated at ~180 years. Core specimen for Highland Dendrochronology Project.",
    status: "PUBLISHED",
    publishedAt: "2024-06-20T10:00:00.000Z",
    photos: [
      {
        id: "photo-pinus-1",
        specimenId: "spec-3",
        storageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80",
        altText: "Pinus sylvestris branchlet with paired needles and ovulate cone",
        caption: "Fascicle detail: Glaucous paired needles and mature ovuliferous cone",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-06-18T09:15:00.000Z",
        fileSizeBytes: 53e4,
        dimensions: "1600x1066"
      },
      {
        id: "photo-pinus-2",
        specimenId: "spec-3",
        storageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
        altText: "Old growth Caledonian Scots pine forest canopy with morning mist",
        caption: "Habitat stand: Old-growth Caledonian pine forest with heath understory",
        displayOrder: 1,
        isPrimary: false,
        uploadTimestamp: "2024-06-18T09:20:00.000Z",
        fileSizeBytes: 62e4,
        dimensions: "1920x1280"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-004",
    commonName: "Wild Dog Rose",
    scientificName: "Rosa canina L.",
    kingdom: "Plantae",
    family: "Rosaceae",
    genus: "Rosa",
    species: "canina",
    morphology: "Deciduous scrambling shrub 1-5 m tall with arching, vigorous green stems armed with sharp, stout, backward-curving prickles. Leaves odd-pinnate with 5-7 ovate-elliptic serrated leaflets. Flowers solitary or in corymbs of 2-5, fragrant, 4-6 cm across; 5 petals ranging from pale blush pink to white; 5 pinnatifid reflexed sepals. Fruit a fleshy, ellipsoid bright scarlet hip (1.5-2 cm) crowned with fallen sepal scars.",
    characteristics: "Pinnatifid reflexed sepals; heterogamous canina meiosis with polyploidy; hips rich in ascorbic acid (vitamin C) and carotenoids.",
    description: "Ubiquitous temperate hedgerow rose with delicate pastel blossoms that yield vivid scarlet hips in late autumn, vital for wildlife sustenance.",
    habitat: "Hedgerows, woodland edges, scrublands, calcareous grasslands, riverbanks, and pasture margins.",
    geographicDistribution: "Native across Europe, Northwest Africa, and Western Asia.",
    region: "Central Europe",
    location: "Cotswolds AONB, Gloucestershire, United Kingdom",
    latitude: 51.8333,
    longitude: -2,
    collectorName: "Sarah Lindqvist",
    collectionDate: "2024-07-04",
    collectionLocation: "Ancient hedgerow along limestone lane near Winchcombe, 160m",
    coordinates: `51\xB050'00.0"N 2\xB000'00.0"W`,
    collectionNotes: "Collected in early fruit set; both flower corolla pressings and immature hips mounted on voucher sheet.",
    conservationStatus: "Least Concern",
    traditionalUses: "Rose hips collected for syrups, jams, and medicinal teas, particularly during wartime rationing as a primary vitamin C source.",
    medicinalUses: "Galactolipid (GOPO) and polyphenol content researched for anti-inflammatory efficacy in managing osteoarthritis and joint mobility.",
    ecologicalUses: "Crucial winter food supply for thrushes, waxwings, and fieldfares; protective nesting shelter in thick hedgerows.",
    otherNotes: "Herbarium specimen prepared using silica gel rapid-drying to preserve petal pigments.",
    status: "PUBLISHED",
    publishedAt: "2024-07-08T16:00:00.000Z",
    photos: [
      {
        id: "photo-rosa-1",
        specimenId: "spec-4",
        storageUrl: "https://images.unsplash.com/photo-1558693169-2342419efb4b?auto=format&fit=crop&w=1200&q=80",
        altText: "Rosa canina flower in full bloom showing five delicate pink petals and golden stamens",
        caption: "Flower morphology: Pentamerous blossom with reflexed pinnatifid calyx",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-07-06T14:10:00.000Z",
        fileSizeBytes: 395e3,
        dimensions: "1400x1050"
      },
      {
        id: "photo-rosa-2",
        specimenId: "spec-4",
        storageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        altText: "Bright red rose hips of Rosa canina in late autumn with dew",
        caption: "Fructification: Mature hypanthia (rose hips) rich in carotenoids and ascorbic acid",
        displayOrder: 1,
        isPrimary: false,
        uploadTimestamp: "2024-07-06T14:15:00.000Z",
        fileSizeBytes: 47e4,
        dimensions: "1600x1200"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-005",
    commonName: "Pedunculate English Oak",
    scientificName: "Quercus robur L.",
    kingdom: "Plantae",
    family: "Fagaceae",
    genus: "Quercus",
    species: "robur",
    morphology: "Massive deciduous hardwood tree capable of reaching 40 m in height with broad, spreading crown. Leaves obovate, 7-14 cm long, deeply 4-7 lobed on each side with very short petioles (2-7 mm) and distinctive ear-like auricles at blade base. Flowers monoecious; male catkins pendulous; female flowers on long peduncles. Fruit an acorn (nut) 1.5-3 cm long, held in a cupule on a long slender stalk (peduncle 2-8 cm).",
    characteristics: "Acutely pedunculate acorns (long fruit stalk); subsessile auricled leaves distinguishing it from Quercus petraea; extreme longevity (exceeding 800 years).",
    description: "Iconic climax forest tree of temperate Europe, venerated in folklore, prized for durable heartwood, and supporting over 2,300 species of associated organisms.",
    habitat: "Fertile lowland alluvial plains, deep moist loam soils, deciduous oak-hornbeam woodlands.",
    geographicDistribution: "Native throughout Europe to the Caucasus and Anatolia.",
    region: "Western & Central Europe",
    location: "Fontainebleau Forest, \xCEle-de-France, France",
    latitude: 48.4,
    longitude: 2.7,
    collectorName: "Dr. Eleanor Vance & Dr. Henri Dubois",
    collectionDate: "2024-08-02",
    collectionLocation: "Parcelle des Ventes-Barbier, 120m elevation",
    coordinates: `48\xB024'00.0"N 2\xB042'00.0"E`,
    collectionNotes: "Twig with mature pedunculate acorns and typical auriculate leaves. Oak gall (Andricus kollari) attached to specimen.",
    conservationStatus: "Least Concern",
    traditionalUses: "Heartwood revered for timber framing, naval construction, and wine aging barrels; acorns used for traditional pig pannage in deciduous woods.",
    medicinalUses: "Bark rich in hydrolyzable tannins (ellagitannins, gallotannins) used as an astringent decoction for oral inflammation and dermatological rinses.",
    ecologicalUses: "Foundational biodiversity host tree: supports hundreds of specialized phytophagous insects, mycorrhizal fungi (Boletus edulis), lichens, and hole-nesting birds.",
    otherNotes: "Associated cynipid wasp gall specimen cataloged under #GAL-2024-08.",
    status: "PUBLISHED",
    publishedAt: "2024-08-06T11:00:00.000Z",
    photos: [
      {
        id: "photo-quercus-1",
        specimenId: "spec-5",
        storageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
        altText: "Pedunculate oak foliage showing lobed leaves and long acorn peduncles",
        caption: "Diagnostic foliage: Short-petioled auricled lamina with pedunculate acorn cluster",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-04T12:00:00.000Z",
        fileSizeBytes: 54e4,
        dimensions: "1600x1067"
      },
      {
        id: "photo-quercus-2",
        specimenId: "spec-5",
        storageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
        altText: "Ancient Quercus robur veteran oak tree in misty pasture",
        caption: "Habit: Veteran specimen exceeding 400 years with broad spreading dome crown",
        displayOrder: 1,
        isPrimary: false,
        uploadTimestamp: "2024-08-04T12:05:00.000Z",
        fileSizeBytes: 69e4,
        dimensions: "1920x1280"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-006",
    commonName: "True English Lavender",
    scientificName: "Lavandula angustifolia Mill.",
    kingdom: "Plantae",
    family: "Lamiaceae",
    genus: "Lavandula",
    species: "angustifolia",
    morphology: "Aromatic evergreen compact shrub 30-80 cm tall. Lower branches woody and branched; young shoots quadrangular, grayish-green, tomentose. Leaves opposite, linear to lanceolate, 2-6 cm long with revolute margins, densely covered with glandular trichomes. Inflorescence a terminal spike of verticillasters (whorls) on long unbranched peduncles; corolla bilabiate, 10-12 mm, deep violet-blue; calyx tubular with 5 teeth.",
    characteristics: "Square stems; bilabiate violet corolla; peltate glandular trichomes containing linalool and linalyl acetate; highly drought-tolerant xerophyte.",
    description: "Quintessential Mediterranean aromatic shrub cultivated for millennia for its calming volatile oils, culinary essences, and vibrant nectar-rich blooms.",
    habitat: "Dry, sunny, rocky limestone slopes, calcareous garrigue, and Mediterranean subalpine plateaus.",
    geographicDistribution: "Native to the Western Mediterranean region (France, Spain, Italy); widely cultivated globally in temperate zones.",
    region: "Mediterranean Basin",
    location: "Plateau de Valensole, Alpes-de-Haute-Provence, France",
    latitude: 43.8375,
    longitude: 5.9861,
    collectorName: "Dr. Aarav Patel",
    collectionDate: "2024-07-18",
    collectionLocation: "Limestone hillside terrace, 680m elevation",
    coordinates: `43\xB050'15.0"N 5\xB059'10.0"E`,
    collectionNotes: "Collected in early morning at 20% bloom opening for optimal essential oil profile analysis.",
    conservationStatus: "Least Concern",
    traditionalUses: "Linen sachet perfumery, insect deterrent, culinary flavoring in herbes de Provence, and soothing herbal infusions.",
    medicinalUses: "Essential oil containing linalool, linalyl acetate, and lavandulol exhibits anxiolytic, mild sedative, and wound-healing properties via GABA-A receptor modulation.",
    ecologicalUses: "Major midsummer nectar resource for Apis mellifera (producing monocladal lavender honey) and diverse Lepidopteran pollinators.",
    otherNotes: "Chromatographic profile attached to accession voucher record.",
    status: "PUBLISHED",
    publishedAt: "2024-07-22T08:30:00.000Z",
    photos: [
      {
        id: "photo-lavandula-1",
        specimenId: "spec-6",
        storageUrl: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80",
        altText: "Lavandula angustifolia flowering spike in full lavender bloom with morning light",
        caption: "Inflorescence detail: Interrupted verticillaster spike with bilabiate corollas",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-07-20T10:00:00.000Z",
        fileSizeBytes: 43e4,
        dimensions: "1600x1200"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-007",
    commonName: "Mountain Arnica / Wolfsbane",
    scientificName: "Arnica montana L.",
    kingdom: "Plantae",
    family: "Asteraceae",
    genus: "Arnica",
    species: "montana",
    morphology: "Aromatic perennial herbaceous plant 20-60 cm tall with short horizontal rhizome. Basal leaves arranged in a flat rosette, sessile, obovate to elliptical, with 5-7 prominent parallel veins and glandular pubescence. Stem erect, glandular-pubescent, with 1-2 pairs of opposite cauline leaves. Capitula (flowerheads) solitary or in triads, 5-8 cm in diameter, with vibrant golden-yellow 3-toothed ray florets and central tubular disc florets.",
    characteristics: "Opposite cauline leaves (rare in Asteraceae); distinctive 3-toothed golden ray florets; sesquiterpene lactones (helenalin); obligate calcifuge.",
    description: "Subalpine European mountain treasure, historically celebrated as an alpine panacea for bruises, sprains, and muscle fatigue, now under strict conservation.",
    habitat: "Nutrient-poor acidic siliceous grasslands, Nardus stricta heaths, subalpine pastures, and mountain bogs from 500 to 2,500 m.",
    geographicDistribution: "Endemic to European mountain systems (Alps, Pyrenees, Carpathians, Vosges, Balkans).",
    region: "European Mountain Ranges",
    location: "Bernese Oberland, Valais / Bern, Switzerland",
    latitude: 46.58,
    longitude: 7.95,
    collectorName: "Sarah Lindqvist & Dr. Eleanor Vance",
    collectionDate: "2024-07-29",
    collectionLocation: "Alpine mat grassland near Kleine Scheidegg, 2,050m elevation",
    coordinates: `46\xB034'48.0"N 7\xB057'00.0"E`,
    collectionNotes: "Carefully collected under Swiss Cantonal Botanical Research Permit #CH-BE-2024-091; roots left intact in situ.",
    conservationStatus: "Vulnerable",
    traditionalUses: 'Traditional Alpine remedy known as "Fallkraut" (fall-herb) applied externally for physical trauma and contusions.',
    medicinalUses: "Helenalin-type sesquiterpene lactones strongly inhibit the transcription factor NF-kB, suppressing inflammatory cytokine cascades; strictly topical.",
    ecologicalUses: "High-altitude specialist attracting alpine butterflies (Erebia, Parnassius) and solitary bees.",
    otherNotes: "Strictly protected under Annex V of EU Habitats Directive. Special conservation monitoring taxon.",
    status: "PUBLISHED",
    publishedAt: "2024-08-03T15:00:00.000Z",
    photos: [
      {
        id: "photo-arnica-1",
        specimenId: "spec-7",
        storageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        altText: "Arnica montana golden flowerhead on subalpine mountain meadow",
        caption: "Capitulum view: Golden-yellow ray florets with 3-toothed apices and dense glandular involucre",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-01T16:00:00.000Z",
        fileSizeBytes: 49e4,
        dimensions: "1600x1200"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-008",
    commonName: "European English Yew",
    scientificName: "Taxus baccata L.",
    kingdom: "Plantae",
    family: "Taxaceae",
    genus: "Taxus",
    species: "baccata",
    morphology: "Slow-growing, evergreen dioecious coniferous tree or large shrub reaching 10-20 m, with dense spreading crown and reddish-brown peeling bark. Leaves flat, linear, dark glossy green above, pale green with two stomatal bands below, 1-4 cm long, spirally arranged but twisted into two lateral ranks. Male cones small, globular, shedding sulfur-yellow pollen in early spring. Female plants bear single seeds surrounded by a succulent, cup-shaped, scarlet fleshy aril.",
    characteristics: "Non-resinous conifer lacking typical cones; gymnosperm with bright red fleshy aril as sole non-toxic organ; presence of taxane alkaloid toxins.",
    description: "One of Europe\u2019s longest-lived native trees, often associated with ancient sacred groves and churchyards, surviving for well over 2,000 years.",
    habitat: "Shady limestone screes, calcareous beech-oak woodlands, rocky gorges, and upland slopes.",
    geographicDistribution: "Native across Western, Central, and Southern Europe, Northwest Africa, and Southwest Asia.",
    region: "Western & Southern Europe",
    location: "Kingley Vale National Nature Reserve, West Sussex, UK",
    latitude: 50.8833,
    longitude: -0.8333,
    collectorName: "Dr. Eleanor Vance",
    collectionDate: "2024-08-10",
    collectionLocation: "Chalk valley floor within ancient yew grove, 95m",
    coordinates: `50\xB053'00.0"N 0\xB050'00.0"W`,
    collectionNotes: "Female fertile branchlet with mature scarlet arils; male strobili specimen mounted on separate sheet #SHB-2024-008b.",
    conservationStatus: "Least Concern",
    traditionalUses: "Heartwood unmatched in elasticity and tensile strength, historically prized for English medieval longbows.",
    medicinalUses: "Needles contain precursor 10-deacetylbaccatin III, synthesized into paclitaxel (Taxol) and docetaxel, crucial microtubule-stabilizing chemotherapeutic agents.",
    ecologicalUses: "Red arils eagerly consumed by mistle thrushes, blackbirds, and greenfinches, which defecate viable seeds while digesting the pulp.",
    otherNotes: "Warning: Foliage and seeds contain lethal taxine alkaloids. Handled with protective laboratory protocols.",
    status: "PUBLISHED",
    publishedAt: "2024-08-14T09:30:00.000Z",
    photos: [
      {
        id: "photo-taxus-1",
        specimenId: "spec-8",
        storageUrl: "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1200&q=80",
        altText: "Taxus baccata evergreen foliage with bright red fleshy aril seed",
        caption: "Foliar and reproductive morphology: Flattened bifacial needles with scarlet seed aril",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-12T11:00:00.000Z",
        fileSizeBytes: 445e3,
        dimensions: "1400x1050"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-009",
    commonName: "White Willow",
    scientificName: "Salix alba L.",
    kingdom: "Plantae",
    family: "Salicaceae",
    genus: "Salix",
    species: "alba",
    morphology: "Medium to large deciduous dioecious tree growing up to 25 m tall, often with irregular crown and leaning trunk. Bark grayish-brown, deeply fissured. Young twigs silky-pubescent, olive-green to yellow. Leaves alternate, lanceolate, 5-10 cm long, finely serrated, covered above and below with fine silky white hairs giving the foliage a distinctive shimmering silver-white appearance in breeze. Inflorescences erect cylindrical catkins produced in spring with leaves.",
    characteristics: "Silky sericeous foliage; flexuous branches; high salicin glucoside content in bark; rapid vegetative propagation from dormant cuttings.",
    description: "Classic riparian wetland tree bordering lowland rivers and floodplains across Europe, immortalized as the historical natural source of salicylic acid.",
    habitat: "Riverbanks, lake shores, wetlands, marshy floodplains, and alluvial damp soils.",
    geographicDistribution: "Native across Europe, Western and Central Asia, and Northwest Africa.",
    region: "Central & Eastern Europe",
    location: "Danube Delta Biosphere Reserve, Tulcea County, Romania",
    latitude: 45.1833,
    longitude: 29.65,
    collectorName: "Sarah Lindqvist & Dr. Aarav Patel",
    collectionDate: "2024-08-14",
    collectionLocation: "Main channel riverbank, 2m elevation, waterlogged silt substrate",
    coordinates: `45\xB011'00.0"N 29\xB039'00.0"E`,
    collectionNotes: "Foliage shoot showing silvery abaxial pubescence; bark sample preserved for chemical reference.",
    conservationStatus: "Least Concern",
    traditionalUses: "Flexible young shoots (withies) woven for traditional wicker basketry and river revetment wattles; wood used for cricket bats and charcoal.",
    medicinalUses: "Salicin extracted from willow bark is metabolized in the liver to salicylic acid, inspiring the original synthesis of acetylsalicylic acid (Aspirin).",
    ecologicalUses: "Pivotal riverbank soil stabilizer preventing alluvial erosion; vital early-spring nectar and pollen source for awakening queen bumblebees.",
    otherNotes: "Subspecies Salix alba subsp. vitellina cross-referenced in living collections.",
    status: "PUBLISHED",
    publishedAt: "2024-08-16T13:00:00.000Z",
    photos: [
      {
        id: "photo-salix-1",
        specimenId: "spec-9",
        storageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
        altText: "Salix alba silvery white willow branches swaying over calm river water",
        caption: "Habit & foliage: Lanceolate sericeous leaves along riparian alluvial waterway",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-15T10:00:00.000Z",
        fileSizeBytes: 52e4,
        dimensions: "1600x1066"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-010",
    commonName: "Eastern Purple Coneflower",
    scientificName: "Echinacea purpurea (L.) Moench",
    kingdom: "Plantae",
    family: "Asteraceae",
    genus: "Echinacea",
    species: "purpurea",
    morphology: "Herbaceous perennial reaching 80-120 cm in height with fibrous roots. Stems stout, rough-hairy, dark green often speckled with purple. Leaves alternate, ovate to broadly lanceolate, 10-20 cm long, coarsely toothed with rough scabrous texture. Inflorescence a prominent solitary terminal capitulum; central disc elevated into a spiny conical dome with sharp orange-brown paleae (chaffy scales); ray florets 12-20, drooping, rose-purple, 3-8 cm long.",
    characteristics: "Prickly hedgehog-like cone receptacle (hence Echinacea, from Greek echinos = hedgehog); drooping purple ray florets; rich in caffeic acid derivatives (cichoric acid).",
    description: "Iconic North American prairie composite widely researched for immunomodulatory properties and beloved in botanical conservation gardens.",
    habitat: "Tallgrass prairies, dry open woods, savannahs, limestone glades, and road verges.",
    geographicDistribution: "Native to Eastern and Central North America (Midwest & Southeastern United States).",
    region: "North America",
    location: "Shaw Nature Reserve, Franklin County, Missouri, USA",
    latitude: 38.48,
    longitude: -90.82,
    collectorName: "Dr. Aarav Patel & Prof. Clara Simmons",
    collectionDate: "2024-08-15",
    collectionLocation: "Restored tallgrass prairie meadow, 210m elevation",
    coordinates: `38\xB028'48.0"N 90\xB049'12.0"W`,
    collectionNotes: "Flowering head in prime anthesis with spiny cone scales and basal foliage pressed.",
    conservationStatus: "Least Concern",
    traditionalUses: "Indispensable panacea of Plains indigenous nations (Lakota, Omaha, Ponca) for snakebites, toothaches, wounds, and respiratory ailments.",
    medicinalUses: "Alkylamides, polysaccharides, and cichoric acid stimulate macrophage phagocytosis and respiratory immune resilience.",
    ecologicalUses: "Key nectar provider for monarch butterflies (Danaus plexippus) and swallowtails; goldfinches feed heavily on seed cones in winter.",
    otherNotes: "Pollen morphology recorded with scanning electron microscopy.",
    status: "PUBLISHED",
    publishedAt: "2024-08-17T11:00:00.000Z",
    photos: [
      {
        id: "photo-echinacea-1",
        specimenId: "spec-10",
        storageUrl: "https://images.unsplash.com/photo-1566847438217-76f82d383fca?auto=format&fit=crop&w=1200&q=80",
        altText: "Echinacea purpurea flowerhead showing spiny central cone and drooping purple petals",
        caption: "Floral architecture: Prominent spiny receptacular cone flanked by reflexed ray florets",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-16T15:00:00.000Z",
        fileSizeBytes: 46e4,
        dimensions: "1600x1200"
      }
    ]
  },
  {
    accessionNumber: "SHB-2024-011",
    commonName: "Southern Maidenhair Fern",
    scientificName: "Adiantum capillus-veneris L.",
    kingdom: "Plantae",
    family: "Pteridaceae",
    genus: "Adiantum",
    species: "capillus-veneris",
    morphology: "Delicate, creeping leptosporangiate fern 15-40 cm tall with slender, branched, scaly rhizomes. Fronds arching or pendulous, bipinnate to tripinnate; stipe and rachis wiry, polished ebony-black. Pinnules (leaflets) wedge-shaped to fan-shaped, 1-2 cm broad, paper-thin, bright green, delicately lobed at outer margin. Sori arranged along the undersides of recurved marginal lobes (false indusia), protecting sporangia.",
    characteristics: "Hydrophobic foliage shedding water drops without wetting (Greek adiantos = unwetted); glossy black wiry stipes; fan-shaped crenate pinnules with false indusia.",
    description: "An exquisitely graceful fern thriving in wet calcified limestone clefts, grottos, and waterfall spray zones across temperate and subtropical climes.",
    habitat: "Dripping limestone cliffs, tufa cascades, damp cave mouths, masonry walls, and shaded travertine gorges.",
    geographicDistribution: "Cosmopolitan across warm-temperate and subtropical regions: Mediterranean Basin, Southern Europe, Africa, Americas, and Southern Asia.",
    region: "Mediterranean & Subtropics",
    location: "Krka National Park, \u0160ibenik-Knin County, Croatia",
    latitude: 43.8,
    longitude: 15.9667,
    collectorName: "Sarah Lindqvist",
    collectionDate: "2024-08-16",
    collectionLocation: "Tufa waterfall travertine face near Skradinski Buk, 45m",
    coordinates: `43\xB048'00.0"N 15\xB058'00.0"E`,
    collectionNotes: "Entire fertile frond with intact rhizome fragment and distinct false indusial margins.",
    conservationStatus: "Least Concern",
    traditionalUses: 'Traditional Mediterranean herbal syrup ("Sirop de Capillaire") prepared for bronchial soothing and mild cough relief.',
    medicinalUses: "Flavonoids (rutin, isoquercitrin) and triterpenoids exhibit mild expectorant and demulcent properties.",
    ecologicalUses: "Specialized pioneer of calcareous travertine and tufa ecosystems, contributing to organic substrate accumulation on bare vertical rock.",
    otherNotes: "Mounted with acid-free archival linen strapping to protect fragile stipes.",
    status: "PUBLISHED",
    publishedAt: "2024-08-17T14:30:00.000Z",
    photos: []
  },
  {
    accessionNumber: "SHB-2024-012",
    commonName: "Deadly Nightshade / Belladonna",
    scientificName: "Atropa belladonna L.",
    kingdom: "Plantae",
    family: "Solanaceae",
    genus: "Atropa",
    species: "belladonna",
    morphology: "Branching perennial herb growing 1-2 m tall from a thick, fleshy white taproot. Stems stout, purplish-green, finely pubescent. Leaves alternate or in unequal pairs, ovate to elliptic, 8-20 cm long, entire, dull dark green. Flowers solitary, nodding on short axillary pedicels; corolla dull bell-shaped, 2.5-3 cm long, brownish-purple with greenish veins. Fruit a glistening, globose, cherry-sized berry (1.5 cm) turning from green to deep pitch black, seated in a star-shaped persistent calyx.",
    characteristics: "Dull brownish-purple campanulate corollas; glistening pitch-black toxic berries with 5-lobed persistent calyx; high tropane alkaloid content.",
    description: "Renowned member of the Solanaceae family with profound historical, toxicological, and pharmacological prominence.",
    habitat: "Calcareous scrubland, disturbed chalky soils, beech woods, limestone quarries, and ancient ruins.",
    geographicDistribution: "Native across Southern, Central, and Western Europe, North Africa, and Western Asia.",
    region: "Southern & Western Europe",
    location: "Wye Valley AONB, Monmouthshire, Wales, UK",
    latitude: 51.7,
    longitude: -2.6667,
    collectorName: "Dr. Eleanor Vance & Dr. Aarav Patel",
    collectionDate: "2024-08-17",
    collectionLocation: "Disused limestone quarry clearing, 140m elevation",
    coordinates: `51\xB042'00.0"N 2\xB040'00.0"W`,
    collectionNotes: "Specimen in simultaneous bloom and early black berry stage; pressed under strict safety guidelines.",
    conservationStatus: "Least Concern",
    traditionalUses: 'Historical cosmetic use in Renaissance Italy (drops used by women to dilate pupils, hence "bella donna" = beautiful lady); archaic surgical anesthetic.',
    medicinalUses: "Primary source of tropane alkaloids atropine, scopolamine, and hyoscyamine \u2014 competitive muscarinic acetylcholine antagonists used in ophthalmology and bradycardia resuscitation.",
    ecologicalUses: "Larval host plant for specialized flea beetles (Epitrix atropae) and doryline moths.",
    otherNotes: "Warning: Extremely poisonous. Kept in secured institutional herbarium vault.",
    status: "DRAFT",
    publishedAt: null,
    photos: [
      {
        id: "photo-atropa-1",
        specimenId: "spec-12",
        storageUrl: "https://pixabay.com/images/download/lancier-gingko-5789687_1920.jpg",
        altText: "Atropa belladonna flowering branch with purple campanulate flowers and green calyx",
        caption: "Inflorescence: Campanulate brownish-purple flowers on axillary pedicels",
        displayOrder: 0,
        isPrimary: true,
        uploadTimestamp: "2024-08-17T12:00:00.000Z",
        fileSizeBytes: 39e4,
        dimensions: "1400x1050"
      }
    ]
  }
];
class HerbariumDatabase {
  data;
  constructor() {
    this.data = this.loadDatabase();
  }
  loadDatabase() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Error reading database file, re-initializing:", err);
      }
    }
    const superadminPasswordHash = bcrypt.hashSync("Faisal@123", bcrypt.genSaltSync(10));
    const adminPasswordHash = bcrypt.hashSync("Shoaib@123", bcrypt.genSaltSync(10));
    const superadminUser = {
      id: "usr-faisal-001",
      name: "Faisal Abbas",
      email: "faisalabbas@gmail.com",
      role: "superadmin",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      institution: "Gilgit-Baltistan Herbarium Archive",
      createdAt: "2024-01-10T08:00:00.000Z",
      lastLoginAt: (/* @__PURE__ */ new Date()).toISOString(),
      passwordHash: superadminPasswordHash
    };
    const adminUser = {
      id: "usr-shoaib-002",
      name: "Shoaib",
      email: "shoaib@gmail.com",
      role: "curator",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      institution: "Gilgit-Baltistan Herbarium Archive",
      createdAt: "2024-02-15T09:00:00.000Z",
      lastLoginAt: "2026-08-16T14:20:00.000Z",
      passwordHash: adminPasswordHash
    };
    const managerUser = {
      id: "usr-lindqvist-003",
      name: "Sarah Lindqvist",
      email: "s.lindqvist@gb-herbarium.org",
      role: "curator",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      institution: "Gilgit-Baltistan Herbarium Archive",
      createdAt: "2024-03-01T10:00:00.000Z",
      lastLoginAt: "2026-08-17T11:45:00.000Z",
      passwordHash: adminPasswordHash
    };
    const seededSpecimens = SEED_BOTANICAL_SPECIMENS.map((s, idx) => {
      const id = `spec-${idx + 1}`;
      const photos = s.photos.map((p, pIdx) => ({
        ...p,
        id: `photo-${id}-${pIdx + 1}`,
        specimenId: id
      }));
      return {
        ...s,
        id,
        photos,
        createdBy: superadminUser.id,
        createdByName: superadminUser.name,
        updatedBy: superadminUser.id,
        updatedByName: superadminUser.name,
        createdAt: "2024-04-10T08:00:00.000Z",
        updatedAt: "2026-08-17T15:00:00.000Z"
      };
    });
    const initialLogs = [
      {
        id: "act-001",
        userId: superadminUser.id,
        userName: superadminUser.name,
        userEmail: superadminUser.email,
        action: "PUBLISH",
        specimenId: "spec-1",
        specimenAccession: "SHB-2024-001",
        specimenScientificName: "Ginkgo biloba L.",
        fieldChanged: "status",
        previousValue: "DRAFT",
        newValue: "PUBLISHED",
        notes: "Specimen verified with morphological criteria and approved for public research access.",
        timestamp: "2026-08-17T15:00:00.000Z"
      },
      {
        id: "act-002",
        userId: adminUser.id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        action: "PHOTO_ADD",
        specimenId: "spec-10",
        specimenAccession: "SHB-2024-010",
        specimenScientificName: "Echinacea purpurea (L.) Moench",
        fieldChanged: "photos",
        previousValue: null,
        newValue: "photo-echinacea-1",
        notes: "Uploaded stereomicroscopic and field floral habit images.",
        timestamp: "2026-08-16T15:30:00.000Z"
      },
      {
        id: "act-003",
        userId: managerUser.id,
        userName: managerUser.name,
        userEmail: managerUser.email,
        action: "CREATE",
        specimenId: "spec-12",
        specimenAccession: "SHB-2024-012",
        specimenScientificName: "Atropa belladonna L.",
        fieldChanged: null,
        previousValue: null,
        newValue: null,
        notes: "Created initial specimen record in Draft status.",
        timestamp: "2026-08-17T12:00:00.000Z"
      }
    ];
    const initialDb = {
      users: [superadminUser, adminUser, managerUser],
      specimens: seededSpecimens,
      specimenPhotos: seededSpecimens.flatMap((s) => s.photos),
      activityLogs: initialLogs,
      adminInvitations: [],
      contactMessages: [
        {
          id: "msg-001",
          name: "Prof. Julian Thorne",
          email: "j.thorne@cambridge-botany.ac.uk",
          subject: "Collaborative DNA barcoding inquiry on Ginkgoales vouchers",
          message: "Dear Gilgit-Baltistan Herbarium Archive curation team, our department is conducting comparative plastid genome sequencing on East Asian Ginkgo specimens. We would like to request high-resolution micrographs of specimen SHB-2024-001.",
          createdAt: "2026-08-15T09:30:00.000Z",
          status: "unread"
        }
      ],
      version: 1
    };
    this.persist(initialDb);
    return initialDb;
  }
  // Writes the current in-memory data (or a given snapshot) to
  // data/herbarium.json. Every method below that changes data calls
  // this.persist() right after making its change, so the JSON file on
  // disk is always kept in sync with what's in memory.
  persist(dbData) {
    const toSave = dbData || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing to herbarium database:", err);
    }
  }
  // --- Users & Auth ---
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }
  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getAllUsers() {
    return this.data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }
  createUser(userData) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const newUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      status: "active",
      institution: userData.institution || "Gilgit-Baltistan Herbarium Archive",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      passwordHash
    };
    this.data.users.push(newUser);
    this.persist();
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }
  updateUserStatus(userId, status) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.status = status;
    this.persist();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  deleteUser(userId) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    if (this.data.users.length !== initialLength) {
      this.persist();
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }
  recordUserLogin(userId) {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
      this.persist();
    }
  }
  // --- Admin Invitations ---
  // Creates a pending invitation with a random, hard-to-guess token. The
  // invitation is not a user account yet — it only becomes one once the
  // invitee opens the invite link and sets a password (see
  // acceptInvitation() below). Invitations automatically expire after 7
  // days if never accepted.
  createInvitation(email, name, role, inviter) {
    const token = crypto.randomBytes(32).toString("hex");
    const invitation = {
      id: `inv-${crypto.randomUUID().slice(0, 8)}`,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
      invitedByUserId: inviter.id,
      invitedByUserName: inviter.name,
      token,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
      // 7 days
    };
    this.data.adminInvitations.push(invitation);
    this.persist();
    return invitation;
  }
  getInvitations() {
    return this.data.adminInvitations;
  }
  findInvitationByToken(token) {
    const inv = this.data.adminInvitations.find((i) => i.token === token && i.status === "pending");
    if (!inv) return null;
    if (new Date(inv.expiresAt) < /* @__PURE__ */ new Date()) {
      inv.status = "expired";
      this.persist();
      return null;
    }
    return inv;
  }
  acceptInvitation(token, password) {
    const inv = this.findInvitationByToken(token);
    if (!inv) return null;
    let existing = this.findUserByEmail(inv.email);
    if (existing) {
      existing.status = "active";
      existing.role = inv.role;
      existing.passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      inv.status = "accepted";
      this.persist();
      const { passwordHash, ...safe } = existing;
      return safe;
    }
    const user = this.createUser({
      name: inv.name,
      email: inv.email,
      password,
      role: inv.role
    });
    inv.status = "accepted";
    this.persist();
    return user;
  }
  revokeInvitation(invitationId) {
    const inv = this.data.adminInvitations.find((i) => i.id === invitationId);
    if (inv) {
      inv.status = "revoked";
      this.persist();
      return true;
    }
    return false;
  }
  deleteInvitation(invitationId) {
    const initialLength = this.data.adminInvitations.length;
    this.data.adminInvitations = this.data.adminInvitations.filter(
      (i) => i.id !== invitationId && i.token !== invitationId
    );
    if (this.data.adminInvitations.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
  // --- Specimens CRUD ---
  searchSpecimens(params, isAdmin = false) {
    let list = [...this.data.specimens];
    if (!isAdmin) {
      list = list.filter((s) => s.status === "PUBLISHED");
    } else if (params.status && params.status !== "ALL") {
      list = list.filter((s) => s.status === params.status);
    }
    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q) || s.family.toLowerCase().includes(q) || s.genus.toLowerCase().includes(q) || s.species.toLowerCase().includes(q) || s.accessionNumber.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.collectorName.toLowerCase().includes(q)
      );
    }
    if (params.family && params.family !== "ALL") {
      list = list.filter((s) => s.family.toLowerCase() === params.family.toLowerCase());
    }
    if (params.genus && params.genus !== "ALL") {
      list = list.filter((s) => s.genus.toLowerCase() === params.genus.toLowerCase());
    }
    if (params.habitat && params.habitat !== "ALL") {
      const h = params.habitat.toLowerCase();
      list = list.filter((s) => s.habitat.toLowerCase().includes(h));
    }
    if (params.conservationStatus && params.conservationStatus !== "ALL") {
      list = list.filter((s) => s.conservationStatus.toLowerCase() === params.conservationStatus.toLowerCase());
    }
    if (params.region && params.region !== "ALL") {
      const r = params.region.toLowerCase();
      list = list.filter((s) => s.region.toLowerCase().includes(r));
    }
    if (params.location && params.location.trim()) {
      const l = params.location.toLowerCase();
      list = list.filter((s) => s.location.toLowerCase().includes(l) || s.collectionLocation.toLowerCase().includes(l));
    }
    if (params.dateFrom) {
      list = list.filter((s) => s.collectionDate >= params.dateFrom);
    }
    if (params.dateTo) {
      list = list.filter((s) => s.collectionDate <= params.dateTo);
    }
    const sort = params.sortBy || "updated-desc";
    list.sort((a, b) => {
      if (sort === "name-asc") return a.scientificName.localeCompare(b.scientificName);
      if (sort === "name-desc") return b.scientificName.localeCompare(a.scientificName);
      if (sort === "accession-asc") return a.accessionNumber.localeCompare(b.accessionNumber);
      if (sort === "conservation") return a.conservationStatus.localeCompare(b.conservationStatus);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 12));
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages
    };
  }
  getAutocompleteSuggestions(query, isAdmin = false) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    let specimens = this.data.specimens;
    if (!isAdmin) {
      specimens = specimens.filter((s) => s.status === "PUBLISHED");
    }
    const suggestions = [];
    const seen = /* @__PURE__ */ new Set();
    for (const s of specimens) {
      if (s.scientificName.toLowerCase().includes(q) && !seen.has(s.scientificName)) {
        seen.add(s.scientificName);
        suggestions.push({ title: s.scientificName, type: "scientific", id: s.id });
      }
      if (s.commonName.toLowerCase().includes(q) && !seen.has(s.commonName)) {
        seen.add(s.commonName);
        suggestions.push({ title: s.commonName, type: "common", id: s.id });
      }
      if (s.accessionNumber.toLowerCase().includes(q) && !seen.has(s.accessionNumber)) {
        seen.add(s.accessionNumber);
        suggestions.push({ title: `${s.accessionNumber} (${s.scientificName})`, type: "accession", id: s.id });
      }
      if (s.family.toLowerCase().includes(q) && !seen.has(`family:${s.family}`)) {
        seen.add(`family:${s.family}`);
        suggestions.push({ title: `${s.family} (Family)`, type: "family", id: s.id });
      }
      if (suggestions.length >= 8) break;
    }
    return suggestions;
  }
  getSpecimenById(id, isAdmin = false) {
    const specimen = this.data.specimens.find((s) => s.id === id || s.accessionNumber.toLowerCase() === id.toLowerCase());
    if (!specimen) return null;
    if (!isAdmin && specimen.status !== "PUBLISHED") return null;
    return specimen;
  }
  getRelatedSpecimens(specimen, limit = 4) {
    return this.data.specimens.filter((s) => s.id !== specimen.id && s.status === "PUBLISHED").filter((s) => s.family.toLowerCase() === specimen.family.toLowerCase() || s.genus.toLowerCase() === specimen.genus.toLowerCase()).slice(0, limit);
  }
  checkAccessionExists(accessionNumber, excludeId) {
    return this.data.specimens.some(
      (s) => s.accessionNumber.toLowerCase() === accessionNumber.toLowerCase().trim() && s.id !== excludeId
    );
  }
  createSpecimen(data, user) {
    const id = `spec-${crypto.randomUUID().slice(0, 8)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    let photos = (data.photos || []).map((p, idx) => ({
      ...p,
      id: p.id || `photo-${crypto.randomUUID().slice(0, 8)}`,
      specimenId: id,
      displayOrder: idx
    }));
    if (photos.length > 0 && !photos.some((p) => p.isPrimary)) {
      photos[0].isPrimary = true;
    }
    const newSpecimen = {
      ...data,
      id,
      photos,
      createdBy: user.id,
      createdByName: user.name,
      updatedBy: user.id,
      updatedByName: user.name,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === "PUBLISHED" ? now : null
    };
    this.data.specimens.unshift(newSpecimen);
    this.persist();
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "CREATE",
      specimenId: id,
      specimenAccession: newSpecimen.accessionNumber,
      specimenScientificName: newSpecimen.scientificName,
      fieldChanged: null,
      previousValue: null,
      newValue: null,
      notes: `Created new specimen ${newSpecimen.accessionNumber} (${newSpecimen.scientificName}) in ${newSpecimen.status} status with ${photos.length} photo(s).`
    });
    return newSpecimen;
  }
  updateSpecimen(id, updates, user) {
    const idx = this.data.specimens.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const existing = this.data.specimens[idx];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const trackedFields = [
      "scientificName",
      "commonName",
      "accessionNumber",
      "family",
      "genus",
      "species",
      "morphology",
      "characteristics",
      "description",
      "habitat",
      "geographicDistribution",
      "region",
      "location",
      "collectorName",
      "collectionDate",
      "collectionLocation",
      "conservationStatus",
      "traditionalUses",
      "medicinalUses",
      "ecologicalUses",
      "status"
    ];
    for (const field of trackedFields) {
      if (updates[field] !== void 0 && updates[field] !== existing[field]) {
        const prevVal = String(existing[field] ?? "");
        const newVal = String(updates[field] ?? "");
        let action = "UPDATE";
        if (field === "status") {
          action = updates.status === "PUBLISHED" ? "PUBLISH" : "UNPUBLISH";
        }
        this.logActivity({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action,
          specimenId: id,
          specimenAccession: existing.accessionNumber,
          specimenScientificName: existing.scientificName,
          fieldChanged: field,
          previousValue: prevVal,
          newValue: newVal,
          notes: `Updated ${field} on specimen ${existing.accessionNumber}`
        });
      }
    }
    let updatedPhotos = updates.photos !== void 0 ? updates.photos : existing.photos;
    if (updatedPhotos.length > 0 && !updatedPhotos.some((p) => p.isPrimary)) {
      updatedPhotos[0].isPrimary = true;
    }
    const updatedPublishedAt = updates.status === "PUBLISHED" && existing.status !== "PUBLISHED" ? now : updates.status === "DRAFT" ? null : existing.publishedAt;
    const updatedSpecimen = {
      ...existing,
      ...updates,
      photos: updatedPhotos,
      updatedBy: user.id,
      updatedByName: user.name,
      updatedAt: now,
      publishedAt: updatedPublishedAt
    };
    this.data.specimens[idx] = updatedSpecimen;
    this.persist();
    return updatedSpecimen;
  }
  deleteSpecimen(id, user) {
    const idx = this.data.specimens.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const deleted = this.data.specimens[idx];
    this.data.specimens.splice(idx, 1);
    this.persist();
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "DELETE",
      specimenId: id,
      specimenAccession: deleted.accessionNumber,
      specimenScientificName: deleted.scientificName,
      fieldChanged: null,
      previousValue: null,
      newValue: null,
      notes: `Permanently deleted specimen ${deleted.accessionNumber} (${deleted.scientificName})`
    });
    return true;
  }
  bulkUpdateStatus(ids, status, user) {
    let count = 0;
    for (const id of ids) {
      const specimen = this.data.specimens.find((s) => s.id === id);
      if (specimen && specimen.status !== status) {
        specimen.status = status;
        specimen.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        specimen.updatedBy = user.id;
        specimen.updatedByName = user.name;
        if (status === "PUBLISHED") specimen.publishedAt = (/* @__PURE__ */ new Date()).toISOString();
        count++;
        this.logActivity({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action: status === "PUBLISHED" ? "PUBLISH" : "UNPUBLISH",
          specimenId: id,
          specimenAccession: specimen.accessionNumber,
          specimenScientificName: specimen.scientificName,
          fieldChanged: "status",
          previousValue: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
          newValue: status,
          notes: `Bulk updated status to ${status}`
        });
      }
    }
    this.persist();
    return count;
  }
  bulkDelete(ids, user) {
    const initialLen = this.data.specimens.length;
    const toDelete = this.data.specimens.filter((s) => ids.includes(s.id));
    this.data.specimens = this.data.specimens.filter((s) => !ids.includes(s.id));
    this.persist();
    for (const s of toDelete) {
      this.logActivity({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: "DELETE",
        specimenId: s.id,
        specimenAccession: s.accessionNumber,
        specimenScientificName: s.scientificName,
        fieldChanged: null,
        previousValue: null,
        newValue: null,
        notes: `Bulk deleted specimen ${s.accessionNumber}`
      });
    }
    return initialLen - this.data.specimens.length;
  }
  // --- Photo Management Actions ---
  // Attaches a photo (already uploaded to /uploads via the
  // POST /api/photos/upload endpoint) to a specimen record. The `photo`
  // argument here contains the storageUrl — the "specimen path" — that
  // was returned by that upload step. A specimen can hold at most 5
  // photos, and the first photo added automatically becomes the primary
  // (cover) photo.
  addPhotoToSpecimen(specimenId, photo, user) {
    const specimen = this.data.specimens.find((s) => s.id === specimenId);
    if (!specimen) return null;
    if (specimen.photos.length >= 5) {
      throw new Error("Maximum of 5 photos reached for this specimen.");
    }
    const photoId = `photo-${crypto.randomUUID().slice(0, 8)}`;
    const isPrimary = specimen.photos.length === 0 || photo.isPrimary;
    if (isPrimary) {
      specimen.photos.forEach((p) => p.isPrimary = false);
    }
    const newPhoto = {
      ...photo,
      id: photoId,
      specimenId,
      displayOrder: specimen.photos.length,
      isPrimary,
      uploadTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    specimen.photos.push(newPhoto);
    specimen.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    specimen.updatedBy = user.id;
    specimen.updatedByName = user.name;
    this.persist();
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "PHOTO_ADD",
      specimenId,
      specimenAccession: specimen.accessionNumber,
      specimenScientificName: specimen.scientificName,
      fieldChanged: "photos",
      previousValue: null,
      newValue: photoId,
      notes: `Added photo: ${newPhoto.altText || "specimen photograph"}`
    });
    return specimen;
  }
  updatePhoto(specimenId, photoId, updates, user) {
    const specimen = this.data.specimens.find((s) => s.id === specimenId);
    if (!specimen) return null;
    const photo = specimen.photos.find((p) => p.id === photoId);
    if (!photo) return null;
    if (updates.isPrimary) {
      specimen.photos.forEach((p) => p.isPrimary = false);
      photo.isPrimary = true;
      this.logActivity({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: "PRIMARY_PHOTO_CHANGE",
        specimenId,
        specimenAccession: specimen.accessionNumber,
        specimenScientificName: specimen.scientificName,
        fieldChanged: "isPrimary",
        previousValue: null,
        newValue: photoId,
        notes: `Designated photo ${photoId} as primary voucher image`
      });
    }
    if (updates.altText !== void 0) photo.altText = updates.altText;
    if (updates.caption !== void 0) photo.caption = updates.caption;
    if (updates.storageUrl !== void 0) {
      const prevUrl = photo.storageUrl;
      photo.storageUrl = updates.storageUrl;
      this.logActivity({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: "PHOTO_REPLACE",
        specimenId,
        specimenAccession: specimen.accessionNumber,
        specimenScientificName: specimen.scientificName,
        fieldChanged: "storageUrl",
        previousValue: prevUrl,
        newValue: updates.storageUrl,
        notes: `Replaced image asset on photo ${photoId}`
      });
    }
    specimen.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.persist();
    return specimen;
  }
  deletePhoto(specimenId, photoId, user) {
    const specimen = this.data.specimens.find((s) => s.id === specimenId);
    if (!specimen) return null;
    const pIdx = specimen.photos.findIndex((p) => p.id === photoId);
    if (pIdx === -1) return null;
    const [deleted] = specimen.photos.splice(pIdx, 1);
    if (deleted.isPrimary && specimen.photos.length > 0) {
      specimen.photos[0].isPrimary = true;
    }
    specimen.photos.forEach((p, idx) => p.displayOrder = idx);
    specimen.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.persist();
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "PHOTO_DELETE",
      specimenId,
      specimenAccession: specimen.accessionNumber,
      specimenScientificName: specimen.scientificName,
      fieldChanged: "photos",
      previousValue: photoId,
      newValue: null,
      notes: `Deleted photograph ${photoId}`
    });
    return specimen;
  }
  reorderPhotos(specimenId, orderedPhotoIds, user) {
    const specimen = this.data.specimens.find((s) => s.id === specimenId);
    if (!specimen) return null;
    const photoMap = new Map(specimen.photos.map((p) => [p.id, p]));
    const reordered = [];
    for (let i = 0; i < orderedPhotoIds.length; i++) {
      const pid = orderedPhotoIds[i];
      const p = photoMap.get(pid);
      if (p) {
        p.displayOrder = i;
        reordered.push(p);
      }
    }
    for (const p of specimen.photos) {
      if (!orderedPhotoIds.includes(p.id)) {
        p.displayOrder = reordered.length;
        reordered.push(p);
      }
    }
    specimen.photos = reordered;
    specimen.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.persist();
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "PHOTO_REORDER",
      specimenId,
      specimenAccession: specimen.accessionNumber,
      specimenScientificName: specimen.scientificName,
      fieldChanged: "displayOrder",
      previousValue: null,
      newValue: orderedPhotoIds.join(","),
      notes: `Reordered gallery photos for ${specimen.accessionNumber}`
    });
    return specimen;
  }
  // --- Dashboard & Analytics ---
  getDashboardStats() {
    const specimens = this.data.specimens;
    const published = specimens.filter((s) => s.status === "PUBLISHED");
    const drafts = specimens.filter((s) => s.status === "DRAFT");
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const addedThisMonth = specimens.filter((s) => new Date(s.createdAt) >= startOfMonth).length;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const recentlyUpdatedCount = specimens.filter((s) => new Date(s.updatedAt) >= thirtyDaysAgo).length;
    const families = new Set(specimens.map((s) => s.family.trim().toLowerCase())).size;
    const genera = new Set(specimens.map((s) => s.genus.trim().toLowerCase())).size;
    const totalPhotos = specimens.reduce((acc, s) => acc + s.photos.length, 0);
    return {
      totalSpecimens: specimens.length,
      publishedCount: published.length,
      draftCount: drafts.length,
      addedThisMonth,
      recentlyUpdatedCount,
      totalFamilies: families,
      totalGenera: genera,
      totalPhotos
    };
  }
  getTaxonomyBreakdown() {
    const families = {};
    const conservation = {};
    for (const s of this.data.specimens) {
      if (s.status === "PUBLISHED") {
        families[s.family] = (families[s.family] || 0) + 1;
        conservation[s.conservationStatus] = (conservation[s.conservationStatus] || 0) + 1;
      }
    }
    return {
      families: Object.entries(families).map(([family, count]) => ({ family, count })).sort((a, b) => b.count - a.count),
      conservation: Object.entries(conservation).map(([status, count]) => ({ status, count }))
    };
  }
  // --- Activity Logs ---
  logActivity(entry) {
    const log = {
      ...entry,
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 1e3) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 1e3);
    }
    this.persist();
  }
  getActivityLogs(limit = 50, actionFilter, specimenId) {
    let logs = [...this.data.activityLogs];
    if (actionFilter && actionFilter !== "ALL") {
      logs = logs.filter((l) => l.action === actionFilter);
    }
    if (specimenId) {
      logs = logs.filter((l) => l.specimenId === specimenId);
    }
    return logs.slice(0, limit);
  }
  // --- Contact Inquiries ---
  createContactMessage(msg) {
    const message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      name: msg.name.trim(),
      email: msg.email.toLowerCase().trim(),
      subject: msg.subject.trim(),
      message: msg.message.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "unread"
    };
    this.data.contactMessages.unshift(message);
    this.persist();
    return message;
  }
  getContactMessages() {
    return this.data.contactMessages;
  }
}
const db = new HerbariumDatabase();
export {
  db
};
