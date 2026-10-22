/*
 * Prénoms sénégalais — source : calendrier « Pour la sauvegarde des prénoms sénégalais » 2018
 * (Idée et conception : Pr Babacar Mbaye Diop, FLSH-UCAD — Direction du Patrimoine Culturel).
 *
 * Codes ethnies (voir ETHNIES plus bas) :
 *   W Wolof · S Sérère · D Diola · P Peul/Toucouleur (Pulaar) · M Mandingue/Socé
 *   SK Soninké (Saraxole) · MK Manjaque (Manjaku) · B Bassari · L Lébou · NC Non classé
 *   Les prénoms du calendrier sans mention d'ethnie sont classés Wolof par défaut.
 *
 * Genre : "f" fille · "m" garçon · "x" mixte ou non encore précisé
 *
 * Sources (par ordre de priorité) :
 *   1. Calendrier du Pr Babacar Mbaye Diop (PRENOMS_CALENDRIER, PRENOMS_AUTRES) — fait foi.
 *   2. Contributions (PRENOMS_CONTRIBUTIONS).
 *   3. Calendrier FayDiaFal 2018 (PRENOMS_FAYDIAFAL), de Djamil Faye, Badou Dia et Ibrahima Fall.
 *   Quand deux prénoms se ressemblent, on garde l'écriture du Pr Diop et l'autre devient
 *   une « autre graphie » (AUTRES_GRAPHIES), utilisée aussi par la recherche.
 *
 * Format calendrier : [date "MM-JJ", prénom, ethnie, genre]
 * Format autres     : [prénom, ethnie, genre]
 */

const ETHNIES = {
  W:  { nom: "Wolof" },
  S:  { nom: "Sérère" },
  D:  { nom: "Diola" },
  P:  { nom: "Peul / Toucouleur", detail: "Pulaar" },
  M:  { nom: "Mandingue / Socé" },
  SK: { nom: "Soninké", detail: "Saraxole" },
  MK: { nom: "Manjaque", detail: "Manjaku" },
  B:  { nom: "Bassari" },
  L:  { nom: "Lébou" },
  NC: { nom: "Non classé", detail: "ethnie à préciser" }
};

const PRENOMS_CALENDRIER = [
  // Janvier
  ["01-01","Teneŋ","S","x"],["01-02","Joor","W","f"],["01-03","Pennda","W","f"],["01-04","Liika","W","x"],
  ["01-05","Ardo","W","m"],["01-06","Kummba","W","f"],["01-07","Jarga","S","x"],["01-08","Gàmmou","W","x"],
  ["01-09","Mbegaan","W","x"],["01-10","Lobbe","W","x"],["01-11","Gor","W","m"],["01-12","Biige","W","f"],
  ["01-13","Seega","W","x"],["01-14","Koddu","W","f"],["01-15","Biraago","W","m"],["01-16","Majigeen","W","f"],
  ["01-17","Farba","W","m"],["01-18","Coro","W","f"],["01-19","Moor","W","m"],["01-20","Caba","W","x"],
  ["01-21","Waali","W","x"],["01-22","Mbaaco","W","x"],["01-23","Mbaxaan","W","x"],["01-24","Garmi","W","x"],
  ["01-25","Miñaan","S","x"],["01-26","Jal","W","x"],["01-27","Sinnjeeli","W","x"],["01-28","Caane","W","f"],
  ["01-29","Magóor","W","m"],["01-30","Daba","W","f"],["01-31","Décce","W","x"],
  // Février
  ["02-01","Mbugaar","W","x"],["02-02","Joojo","W","f"],["02-03","Ndonngo","W","x"],["02-04","Majey","W","m"],
  ["02-05","Njóogu","W","m"],["02-06","Koode","P","x"],["02-07","Njaga","W","m"],["02-08","Ndeela","W","x"],
  ["02-09","Mbaru","W","x"],["02-10","Kameko","MK","x"],["02-11","Jaaga","W","x"],["02-12","Sën","S","x"],
  ["02-13","Xaar","W","x"],["02-14","Màgget","W","x"],["02-15","Ken Bugul","W","x"],["02-16","Amul Yaakaar","W","x"],
  ["02-17","Makoddu","W","m"],["02-18","Njawar","W","x"],["02-19","Mapennda","W","m"],["02-20","Makura","W","m"],
  ["02-21","Wopaa","P","x"],["02-22","Majoojo","W","m"],["02-23","Manjaay","W","m"],["02-24","Mambay","W","m"],
  ["02-25","Majigéen","W","f"],["02-26","Ñilaan","S","f"],["02-27","Malal","W","m"],["02-28","Alburi","W","m"],
  // Mars
  ["03-01","Làttir","W","x"],["03-02","Njole","W","x"],["03-03","Meysa","W","m"],["03-04","Mandaw","W","m"],
  ["03-05","Saaxewar","W","x"],["03-06","Keeba","M","m"],["03-07","Mayekoor","S","m"],["03-08","Yafu","B","f"],
  ["03-09","Lat","W","m"],["03-10","Buguma","W","x"],["03-11","Aguluben","D","x"],["03-12","Bassembo","D","x"],
  ["03-13","Damel","W","m"],["03-14","Ngenaar","W","x"],["03-15","Majaxeer","W","m"],["03-16","Ugat","MK","x"],
  ["03-17","Majaañ","W","m"],["03-18","Soxna","W","f"],["03-19","Jomaay","S","x"],["03-20","Karukaka","MK","x"],
  ["03-21","Jogomaay","S","x"],["03-22","Nini","W","x"],["03-23","Baaba","P","m"],["03-24","Ñalin","D","x"],
  ["03-25","Jogoy","S","x"],["03-26","Ñumma","SK","x"],["03-27","Baylaa","P","x"],["03-28","Uli","W","x"],
  ["03-29","Ngoor","S","m"],["03-30","Uley","W","x"],["03-31","Céyaasin","W","x"],
  // Avril
  ["04-01","Balaago","W","x"],["04-02","Këma","B","f"],["04-03","Bàmba","W","m"],["04-04","Takki","B","f"],
  ["04-05","Yera","B","m"],["04-06","Ñaari","B","f"],["04-07","Maciya","B","f"],["04-08","Baara","W","x"],
  ["04-09","Bàcc","W","x"],["04-10","Urey","W","x"],["04-11","Bayo","P","x"],["04-12","Daawur","W","x"],
  ["04-13","Bekaay","W","x"],["04-14","Mayoro","W","m"],["04-15","Mangóone","W","m"],["04-16","Mbenge","W","x"],
  ["04-17","Biram","W","m"],["04-18","Dërëm","W","x"],["04-19","Biraan","W","x"],["04-20","Julde","P","x"],
  ["04-21","Birima","W","m"],["04-22","Rugi","W","x"],["04-23","Biri","SK","x"],["04-24","Saajo","W","x"],
  ["04-25","Kaposat","MK","x"],["04-26","Këbërpur","MK","x"],["04-27","Afilejo","D","x"],["04-28","Mundoor","S","x"],
  ["04-29","Buli","SK","x"],["04-30","Mbisin","S","x"],
  // Mai
  ["05-01","Cieera","B","f"],["05-02","Maat","S","x"],["05-03","Seeni","W","x"],["05-04","Maam Koor","S","m"],
  ["05-05","Sibet","D","x"],["05-06","Pata","B","m"],["05-07","Siga","W","f"],["05-08","Deeniyanke","P","x"],
  ["05-09","Sira","W","f"],["05-10","Majóob","W","m"],["05-11","Sirabiri","SK","x"],["05-12","Jaxu","P","x"],
  ["05-13","Sooda","P","x"],["05-14","Pocou","MK","x"],["05-15","Saadaga","W","x"],["05-16","Jokkel","S","x"],
  ["05-17","Sukkey","W","x"],["05-18","Jiñaabo","D","x"],["05-19","Macoro","W","m"],["05-20","Masiise","W","m"],
  ["05-21","Tabara","W","f"],["05-22","Dikoori","W","x"],["05-23","Tàkko","P","x"],["05-24","Maxari","W","x"],
  ["05-25","Manjonka","MK","x"],["05-26","Jokkin","D","x"],["05-27","Mosaan","S","f"],["05-28","Nguda","W","x"],
  ["05-29","Bisinti","MK","x"],["05-30","Jibo","P","x"],["05-31","Kafin ko","MK","x"],
  // Juin
  ["06-01","Majaw","W","m"],["06-02","Maseen","W","m"],["06-03","Masar","W","m"],["06-04","Indega","B","m"],
  ["06-05","Fakuru","SK","x"],["06-06","Combaan","W","x"],["06-07","Majong","W","m"],["06-08","Sagar","W","x"],
  ["06-09","Famara","W","m"],["06-10","Tokosel","P","x"],["06-11","Farba","W","m"],["06-12","Toli","P","x"],
  ["06-13","Fatel","W","x"],["06-14","Yaadikóon","W","x"],["06-15","Fóode","W","m"],["06-16","Yaay","W","f"],
  ["06-17","Mafay","W","m"],["06-18","Yànde","S","f"],["06-19","Mandóoy","W","m"],["06-20","Kamakiñaa","MK","x"],
  ["06-21","Fula","P","x"],["06-22","Aliin Siitoe","D","f"],["06-23","Gallaay","W","x"],["06-24","Majuuf","W","m"],
  ["06-25","Góorgi","W","m"],["06-26","Ata","P","x"],["06-27","Góora","W","m"],["06-28","Accaa","P","x"],
  ["06-29","Masàll","W","m"],["06-30","Jëmb","W","x"],
  // Juillet
  ["07-01","Jaal","W","x"],["07-02","Fili","W","x"],["07-03","Njaw","W","x"],["07-04","Mati","W","f"],
  ["07-05","Koorka","P","x"],["07-06","Njaaya","W","x"],["07-07","Mami","B","m"],["07-08","Sabi","B","m"],
  ["07-09","Mayata","W","m"],["07-10","Saalum","W","x"],["07-11","Kinne","W","x"],["07-12","Keebaa","W","x"],
  ["07-13","Kura","W","f"],["07-14","Masàmba","W","m"],["07-15","Faama","W","x"],["07-16","Baay","W","m"],
  ["07-17","Neene","W","f"],["07-18","Sadax","S","x"],["07-19","Yumma","W","f"],["07-20","Njànku","W","x"],
  ["07-21","Ngisali","W","x"],["07-22","Latsug","S","m"],["07-23","Leemu","W","x"],["07-24","Faali","W","x"],
  ["07-25","Maye","S","x"],["07-26","Soose","W","x"],["07-27","Leyti","P","x"],["07-28","Ngalla","W","x"],
  ["07-29","Libaas","W","x"],["07-30","Ceerno","W","m"],["07-31","Ndey","W","f"],
  // Août
  ["08-01","Limaan","W","m"],["08-02","Awentorébé","D","x"],["08-03","Lumbul","W","x"],["08-04","Ayimpen","D","x"],
  ["08-05","Batulii","P","x"],["08-06","Makummba","W","m"],["08-07","Banel","P","f"],["08-08","Maja","W","x"],
  ["08-09","Bile","SK","x"],["08-10","Madikke","W","m"],["08-11","Ndóofeen","W","x"],["08-12","Maadi","W","x"],
  ["08-13","Buwaarika","W","x"],["08-14","Njoor","W","x"],["08-15","Xemess","S","x"],["08-16","Mafaal","W","m"],
  ["08-17","Kommbe","W","x"],["08-18","Sandeene","W","x"],["08-19","Dewel","W","x"],["08-20","Njuk","W","x"],
  ["08-21","Kumboy","SK","x"],["08-22","Maalaŋ","W","m"],["08-23","Daado","SK","x"],["08-24","Maalaw","W","x"],
  ["08-25","Daaka","P","x"],["08-26","Màlle","P","x"],["08-27","Debbo","P","f"],["08-28","Mawdo","W","m"],
  ["08-29","Defaa","P","x"],["08-30","Cendeela","W","x"],["08-31","Selbe","S","f"],
  // Septembre
  ["09-01","Mapaate","W","m"],["09-02","Tama","B","m"],["09-03","Maar","W","x"],["09-04","Déwén","W","x"],
  ["09-05","Jaxeer","W","x"],["09-06","Masekk","W","m"],["09-07","Jaxu","W","x"],["09-08","Mbañig","W","m"],
  ["09-09","Mbugaan","W","x"],["09-10","Mbaaxaan","S","x"],["09-11","Jànke","W","x"],["09-12","Mbaar","S","x"],
  ["09-13","Jaara","W","x"],["09-14","Mabiige","W","m"],["09-15","Jaari","W","x"],["09-16","Mebog","W","x"],
  ["09-17","Diboor","S","f"],["09-18","Ñaaña","W","x"],["09-19","Jewuru","W","x"],["09-20","Meysa","W","m"],
  ["09-21","Juma","W","x"],["09-22","Nàmmóori","M","x"],["09-23","Diib","S","m"],["09-24","Semu","S","x"],
  ["09-25","Jikkel","P","x"],["09-26","Npaali","SK","x"],["09-27","Jilaan","S","x"],["09-28","Saakura","W","x"],
  ["09-29","Degen","W","x"],["09-30","Masoxna","W","m"],
  // Octobre
  ["10-01","Sàmba","W","m"],["10-02","Fabala","P","x"],["10-03","Saamóori","M","m"],["10-04","Faakan","S","f"],
  ["10-05","Guya","W","x"],["10-06","Sànkum","M","x"],["10-07","Giñaan","S","f"],["10-08","Saanoxo","M","x"],
  ["10-09","Gisali","S","x"],["10-10","Séekuba","W","m"],["10-11","Nguy","W","x"],["10-12","Sedaar","S","m"],
  ["10-13","Holèl","P","x"],["10-14","Séeku","W","m"],["10-15","Mbayaŋ","W","x"],["10-16","Sengaan","S","x"],
  ["10-17","Kéwé","L","f"],["10-18","Seriñ","W","m"],["10-19","Ndate","W","x"],["10-20","Sibilumbay","D","x"],
  ["10-21","Xumbaare","SK","x"],["10-22","Sidaat","W","x"],["10-23","Liwaan","S","m"],["10-24","Siyaaka","D","x"],
  ["10-25","Manthita","SK","x"],["10-26","Sihalebe","D","x"],["10-27","Maamasa","SK","x"],["10-28","Sihunke","D","x"],
  ["10-29","Maane","S","x"],["10-30","Sayeer","S","m"],["10-31","Mbeen","W","x"],
  // Novembre
  ["11-01","Ciaara","B","x"],["11-02","Paate","P","m"],["11-03","Kaali","B","m"],["11-04","Ndummbe","W","x"],
  ["11-05","Ndikku","W","x"],["11-06","Suwaareba","W","x"],["11-07","Mboose","W","x"],["11-08","Mañuk","W","x"],
  ["11-09","Njareñul","W","x"],["11-10","Sundjaata","M","m"],["11-11","Kandomelent","MK","x"],["11-12","Sunkaru","W","x"],
  ["11-13","Njaase","W","x"],["11-14","Njaati","W","x"],["11-15","Suuti","W","x"],["11-16","Njéeme","W","x"],
  ["11-17","Tamsiir","W","m"],["11-18","Njóoba","W","x"],["11-19","Buso","W","x"],["11-20","Tanoor","S","m"],
  ["11-21","Ummi","W","x"],["11-22","Tayfóor","W","x"],["11-23","Musu","M","f"],["11-24","Texey","W","x"],
  ["11-25","Amaa","W","f"],["11-26","Tette","D","x"],["11-27","Aram","W","x"],["11-28","Cawlo","W","x"],
  ["11-29","Asa","W","x"],["11-30","Sili","W","x"],
  // Décembre
  ["12-01","Coon","W","x"],["12-02","Yaaram","W","x"],["12-03","Tumaani","M","x"],["12-04","Ñàmboo","W","x"],
  ["12-05","Mëtënaŋ","B","f"],["12-06","Jankook","D","x"],["12-07","Jébbu","W","x"],["12-08","Wasis","W","x"],
  ["12-09","Maba","W","m"],["12-10","Wula","S","x"],["12-11","Majoor","W","m"],["12-12","Kuddu","W","x"],
  ["12-13","Mbàkke","W","m"],["12-14","Yugo","W","x"],["12-15","Jeegaan","S","m"],["12-16","Yero","W","m"],
  ["12-17","Masayeer","W","m"],["12-18","Ageen","D","x"],["12-19","Njug / Njuga","W","x"],["12-20","Isaaga","P","m"],
  ["12-21","Jeewo","P","x"],["12-22","Jankebay","D","x"],["12-23","Siga","W","f"],["12-24","Jamuyon","D","x"],
  ["12-25","Nayicout","MK","x"],["12-26","Kàmbiya","SK","x"],["12-27","Ngóone","S","f"],["12-28","Karamo","SK","m"],
  ["12-29","Siramaadi","SK","x"],["12-30","Xari","W","x"],["12-31","Kawit met","MK","x"]
];

// Prénoms cités hors calendrier (encadrés « D'autres prénoms » et « Autres prénoms »).
const PRENOMS_AUTRES = [
  // Bassari
  ["Pena","B","f"],["Ciyaara","B","m"],
  // Préfixe « Ma » (wolof) — dérivés cités dans le calendrier
  ["Matabara","W","m"],["Marubba","W","m"],["Magey","W","m"],["Magaay","W","m"],["Makan","W","m"],
  ["Manjoon","W","m"],["Majeŋ","W","m"],["Mambaaw","W","m"],
  // Autres prénoms (ethnie non précisée dans le calendrier)
  ["Aamajgeen","NC","x"],["Asiin","NC","x"],["Aamagor","NC","x"],["Aamanex","NC","x"],["Aamakoddu","NC","x"],
  ["Ayta","NC","x"],["Barget","NC","x"],["Bitti","NC","x"],["Bittiloxo","NC","x"],["Borso","NC","x"],
  ["Buri","NC","x"],["Bafu","NC","x"],["Baxaw","NC","x"],["Basi","NC","x"],["Bamar","NC","x"],
  ["Baytiir","NC","x"],["Bator","NC","x"],["Cenndu","NC","x"],["Cuba","NC","x"],["Cofaan","NC","x"],
  ["Cillo","NC","x"],["Cille","NC","x"],["Dagga","NC","x"],["Daro","NC","x"],["Dibokoor","NC","x"],
  ["Demmba","NC","m"],["Diiye","NC","x"],["Dembane","NC","x"],["Daali","NC","x"],["Dikke","NC","x"],
  ["Dille","NC","x"],["Fara","NC","x"],["Fari","NC","x"],["Fekam","NC","x"],["Falla","NC","x"],
  ["Faalay","NC","x"],["Fasar","NC","x"],["Dufi","NC","x"],["Felwin","NC","m"],["Gaana","NC","x"],
  ["Geda","NC","x"],["Gayaan","NC","x"],["Gedado","NC","x"],["Gesiyaan","NC","x"],["Gañsiri","NC","x"],
  ["Ginnda","NC","x"],["Gumayande","NC","x"],["Gormak","NC","x"],["Get","NC","x"],["Gube","NC","x"],
  ["Hammadi","P","m"],["Jooma","NC","x"],["Jamboañ","NC","x"],["Jafe","NC","x"],["Jambal","NC","x"],
  ["Jobe","NC","x"],["Jee","NC","x"],["Jogot","NC","x"],["Jali","NC","x"],["Jaba","NC","x"],
  ["Jimbi","NC","x"],["Joman","NC","x"],["Jommbas","NC","x"],["Jemoodi","NC","x"],["Jengoy","NC","x"],
  ["Jale","NC","x"],["Kasa","NC","x"],["Kudi","NC","x"],["Kodde","NC","x"],["Koso","NC","x"],
  ["Koor","NC","x"],["Korjeen","NC","x"],["Kumburu","NC","x"],["Koña","NC","x"],["Kuna","NC","x"],
  ["Latjoor","NC","m"],["Lisë","NC","x"],["Maget","NC","x"],["Mbisaan","NC","x"],["Mbat","NC","x"],
  ["Mbenda","NC","x"],["Mboya","NC","x"],["Mbana","NC","x"],["Malaŋ","NC","x"],["Moori","NC","x"],
  ["Mecuur","NC","x"],["Malen","NC","x"],["Maga","NC","x"],["Mbaga","NC","x"],["Mberi","NC","x"],
  ["Mberu","NC","x"],["Mafanne","NC","x"],["Magummba","NC","x"],["Mbode","NC","x"],["Malaado","P","f"],
  ["Mbole","NC","x"],["Mañ","NC","x"],["Maama","NC","x"],["Matel","NC","x"],["Manku","NC","x"],
  ["Mani","NC","x"],["Nogay","NC","x"],["Ndaak","NC","x"],["Ndooya","NC","x"],["Ndëba","NC","x"],
  ["Njalu","NC","x"],["Ndew","S","f"],["Njak","NC","x"],["Ndeene","NC","x"],["Ndefa","NC","x"],
  ["Nalla","NC","x"],["Nguri","NC","x"],["Ndaama","NC","x"],["Ngiñaan","NC","x"],["Ngeer","NC","x"],
  ["Nganda","NC","x"],["Njooro","NC","x"],["Njargay","NC","x"],["Ndatta","NC","x"],["Ndeya","NC","x"],
  ["Ndira","NC","x"],["Njiak","NC","x"],["Ngakan","NC","x"],["Ndebaan","S","f"],["Ndukka","NC","x"],
  ["Ngide","NC","x"],["Ndogo","NC","x"],["Njare","NC","x"],["Ngorba","P","x"],["Ngoy","NC","x"],
  ["Ngaan","NC","x"],["Ñium","NC","x"],["Ñumbët","NC","x"],["Ñalla","NC","x"],["Ñaxana","NC","x"],
  ["Ñoŋe","NC","x"],["Ñasa","NC","x"],["Ñimma","NC","x"],["Ñale","NC","x"],["Ñambe","NC","x"],
  ["Ñaama","NC","x"],["Ñannga","NC","x"],["Paya","NC","x"],["Ponu","NC","x"],["Roban","NC","x"],
  ["Sebaan","NC","x"],["Saxoba","NC","x"],["Safuca","NC","x"],["Silni","NC","x"],["Siina","NC","x"],
  ["Siin","NC","x"],["Sangul","NC","x"],["Sawlu","NC","x"],["Sayoro","NC","x"],["Sanu","NC","x"],
  ["Sangóone","NC","f"],["Salaan","NC","x"],["Singeer","NC","x"],["Sawru","P","x"],["Sedar","S","m"],
  ["Simel","NC","x"],["Sonar","S","m"],["Sancali","NC","x"],["Saaja","NC","x"],["Selli","NC","x"],
  ["Saraŋ","NC","x"],["Taala","NC","x"],["Yatta","NC","x"],["Yaaya","NC","x"],["Yeeya","NC","x"],
  ["Yaxara","NC","x"],["Yëm","NC","x"],["Yamar","NC","m"],["Yombe","NC","x"],["Yadi","NC","x"],
  ["Yamb","NC","x"],["Yaaxam","NC","x"],["Yuraan","NC","x"],["Yoni","NC","x"],["Yonnge","NC","x"],
  ["Yerim","NC","m"],["Yendu","NC","x"],["Yoro","NC","x"],["Wejji","NC","x"],["Waranka","NC","x"],
  ["Waynde","NC","x"],["Wore","NC","x"],["Waalti","P","x"],["Xabaan","NC","x"],["Xuri","NC","x"],
  ["Xandiu","NC","x"],["Xoreja","NC","x"],["Xoyan","NC","x"],["Xoy","NC","x"]
];

// Prénoms apportés par des contributions (non présents dans le calendrier du Pr Diop).
const PRENOMS_CONTRIBUTIONS = [
  // Prénoms sérères
  ["Wagane","S","m"],["Modiane","S","m"],["Niokhor","S","m"],["Mame Ndew","S","f"],["Makane","S","f"],
  ["Ngormack","S","m"],["Ngorndéb","S","m"],["Ndébal","S","f"],["Kaynak","S","m"],["Guilgane","S","x"],
  ["Madane","S","x"],["Ndiig","S","x"],["Séék","S","x"],["Roogodéb","S","x"],["Salma Koor","S","m"],
  ["Gaskel","S","m"],["Koumakh","S","m"],["Bougar","S","m"],["Lamaan","S","m"],["Khookhane","S","m"],
  ["Baraane","S","m"],["Watew","S","x"],
  // Cité dans le calendrier du Pr Diop (préfixe « Ma » : Ma-Rubba)
  ["Rubba","W","f"]
];

// Calendrier FayDiaFal 2018 (janvier à juin) : prénoms absents de la liste du Pr Diop.
// Ce calendrier ne précise pas l'ethnie : ils sont « Non classé » en attendant.
const PRENOMS_FAYDIAFAL = [
  ["Thiandama","NC","x"],["Magadoya","NC","x"],["Yélli","NC","x"],["Karfa","NC","m"],["Kissito","NC","m"],
  ["Niokhobaye","NC","x"],["Kimintang","NC","x"],["Diafara","NC","x"],["Fallou","NC","m"],["Sassi","NC","x"],
  ["Pathé","NC","m"],["Diama","NC","x"],["Dièri","NC","x"],["Yoto","NC","x"],["Sélé","NC","x"],
  ["Balla","NC","m"],["Sokhotine","NC","x"],["Aguibou","NC","m"],["Polèl","NC","x"],["Gaoussou","NC","m"],
  ["Koutoubo","NC","x"],["Gnépinta","NC","x"],["Bolo","NC","x"],["Mbargou","NC","x"],["Ogo","NC","x"],
  ["Bakkane","NC","x"],["Isseu","NC","f"],["Derguéne","NC","f"],["Raki","NC","f"],["Socé","NC","x"],
  ["Boguél","NC","x"],["Wandifing","NC","x"],["Thiallal","NC","x"],["Sogui","NC","x"],["Palla","NC","x"],
  ["Ndayane","NC","x"],["Sarata","NC","f"],["Diégui","NC","x"],["Mandoffane","NC","x"],["Bogane","NC","x"],
  ["Lira","NC","x"],["Mbassala","NC","x"],["Mandessit","NC","x"],["Fanta","NC","f"],["Déthialaw","NC","x"],
  ["Mborika","NC","x"],["Galo","NC","x"],["Bengali","NC","x"],["Ndouti","NC","x"],["Toutane","NC","x"],
  ["Mounibé","NC","x"],["Hawly","NC","x"],["Nago","NC","x"],["Banta","NC","x"],["Djinda","NC","x"],
  ["Diaraf","NC","m"],["Thioumbé","NC","x"],["Ndiakhat","NC","x"],["Wassila","NC","x"],["Youga","NC","x"],
  ["Fincoura","NC","x"],["Ndiadiane","NC","x"],["Gniba","NC","x"],["Ndiama","NC","x"],["Kamissokho","NC","m"],
  ["Lala","NC","f"],["Sombél","NC","x"],["Makili","NC","x"],["Ngoundia","NC","x"],["Témour","NC","x"],
  ["Lèna","NC","x"],["Maguilène","NC","x"],["Bassine","NC","x"],["Ngagne","NC","m"],["Ngalgou","NC","x"],
  ["Ndorine","NC","x"],["Dialika","NC","f"],["Malicoumba","NC","x"],["Mankeur","NC","m"],["Mambi","NC","x"],
  ["Ankiling","NC","x"],["Thiémokho","NC","m"]
];

// Autres graphies : prénom de référence → écritures rencontrées ailleurs (FayDiaFal, contributions…).
const AUTRES_GRAPHIES = {
  "Meysa": ["Meissa"], "Ngóone": ["Ngoné"], "Soxna": ["Sokhna"], "Xabaan": ["Khabane"], "Wore": ["Woré"],
  "Mbenda": ["Mbeinda"], "Ndikku": ["Ndickou"], "Kura": ["Coura"], "Ndew": ["Ndéw"], "Ndeela": ["Ndèla"],
  "Liwaan": ["Liwane", "Riwane"], "Njole": ["Ndiolé"], "Gallaay": ["Galaye"], "Mboose": ["Mbossé"],
  "Semu": ["Sémou"], "Ayimpen": ["Ayimpène"], "Mbañig": ["Mbagnick"], "Kummba": ["Coumba"], "Baara": ["Bara"],
  "Koddu": ["Codou"], "Seega": ["Sèga"], "Faalay": ["Falaye"], "Saajo": ["Sadio"], "Fakuru": ["Facourou"],
  "Tokosel": ["Tokossel"], "Jeegaan": ["Diégane"], "Ken Bugul": ["Kenbougoul"], "Coro": ["Thioro"],
  "Sàmba": ["Samba"], "Defaa": ["Défa"], "Joor": ["Dior"], "Ndaak": ["Ndack"], "Mbisaan": ["Mbissane"],
  "Nogay": ["Nogaye"], "Sanu": ["Sanou"], "Ñaaña": ["Gnagna"], "Màlle": ["Mallé"], "Jaxeer": ["Diakhère"],
  "Ndummbe": ["Ndoumbé"], "Njaga": ["Ndiaga"], "Mbaaco": ["Mbathio"], "Xoy": ["Khoy"], "Kommbe": ["Kombé"],
  "Jokkel": ["Diokél"], "Liika": ["Lika"], "Ndate": ["Ndaté"], "Siin": ["Siny"], "Ciaara": ["Thiara"],
  "Njaase": ["Ndiassé"], "Góora": ["Gora"], "Diboor": ["Dibor"], "Baxaw": ["Bakhaw"], "Keeba": ["Kèba"],
  "Ndóofeen": ["Ndoffène"], "Teneŋ": ["Ténéng", "Téning"], "Buguma": ["Bougouma"], "Mbeen": ["Mbène"],
  "Sengaan": ["Senghane"], "Coon": ["Thione"], "Joojo": ["Diodio"], "Demmba": ["Demba"], "Nguy": ["Ngouye"],
  "Sawru": ["Sawrou"], "Yànde": ["Yandé"], "Mbayaŋ": ["Mbayang"], "Nàmmóori": ["Namori"], "Mberi": ["Mbéri"],
  "Mati": ["Maty"], "Ndeene": ["Ndèné"], "Koso": ["Kosso"], "Sinnjeeli": ["Sindièli"], "Jogomaay": ["Diogomaye"],
  "Biige": ["Bigué"], "Saadaga": ["Sadaga"], "Jibo": ["Djibo"], "Garmi": ["Garmy"], "Céyaasin": ["Thieyacine"],
  "Njànku": ["Niankou"], "Aliin Siitoe": ["Alinesitoé"], "Njoor": ["Ndiour"], "Cendeela": ["Thiandéla"],
  "Sayeer": ["Saer"], "Njug / Njuga": ["Ndiouga"], "Gañsiri": ["Gagnesirry"], "Waynde": ["Weyndé"],
  "Yero": ["Yèro"], "Mosaan": ["Mossane"], "Faakan": ["Fakhane"], "Miñaan": ["Mignane"], "Ndebaan": ["Ndébane"],
  "Ñilaan": ["Gnilane"], "Xemess": ["Khémess"], "Maat": ["Maad"], "Sedaar": ["Sédar"], "Giñaan": ["Guiniane"],
  "Mbaar": ["Mbar"], "Sën": ["Sèn"], "Ngoor": ["Ngor"], "Maam Koor": ["Mame Koor"], "Kaynak": ["Kainack"],
  "Rubba": ["Roubba"]
};
