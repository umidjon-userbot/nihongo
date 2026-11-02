/* =========================================================
   KANA DATA — hiragana / katakana, mnemonics, examples
   Katakana glyphs are derived from hiragana (Unicode +0x60).
   ========================================================= */

// Basic gojūon (5 slots per row; null = empty slot)
const KANA_BASIC = [
  { id: 'a', chars: [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']] },
  { id: 'k', chars: [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']] },
  { id: 's', chars: [['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']] },
  { id: 't', chars: [['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']] },
  { id: 'n', chars: [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']] },
  { id: 'h', chars: [['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']] },
  { id: 'm', chars: [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']] },
  { id: 'y', chars: [['や','ya'],null,['ゆ','yu'],null,['よ','yo']] },
  { id: 'r', chars: [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']] },
  { id: 'w', chars: [['わ','wa'],null,null,null,['を','o']] },
  { id: 'nn', chars: [['ん','n'],null,null,null,null] },
];

const KANA_DAKU = [
  { id: 'g', chars: [['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go']] },
  { id: 'z', chars: [['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo']] },
  { id: 'd', chars: [['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do']] },
  { id: 'b', chars: [['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo']] },
  { id: 'p', chars: [['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']] },
];

const KANA_YOON = [
  { id: 'ky', chars: [['きゃ','kya'],['きゅ','kyu'],['きょ','kyo']] },
  { id: 'sh', chars: [['しゃ','sha'],['しゅ','shu'],['しょ','sho']] },
  { id: 'ch', chars: [['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho']] },
  { id: 'ny', chars: [['にゃ','nya'],['にゅ','nyu'],['にょ','nyo']] },
  { id: 'hy', chars: [['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo']] },
  { id: 'my', chars: [['みゃ','mya'],['みゅ','myu'],['みょ','myo']] },
  { id: 'ry', chars: [['りゃ','rya'],['りゅ','ryu'],['りょ','ryo']] },
  { id: 'gy', chars: [['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo']] },
  { id: 'j',  chars: [['じゃ','ja'],['じゅ','ju'],['じょ','jo']] },
  { id: 'by', chars: [['びゃ','bya'],['びゅ','byu'],['びょ','byo']] },
  { id: 'py', chars: [['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']] },
];

// Alternative romaji accepted when typing
const ROMAJI_ALT = {
  shi:['si'], chi:['ti'], tsu:['tu'], fu:['hu'], ji:['zi','di'], zu:['du'], o:['wo'], n:['nn'],
  sha:['sya'], shu:['syu'], sho:['syo'], cha:['tya','cya'], chu:['tyu','cyu'], cho:['tyo','cyo'],
  ja:['zya','jya'], ju:['zyu','jyu'], jo:['zyo','jyo'],
};

/* Hiragana: [mnemonic (uz), example kana, romaji, uz meaning] */
const HIRA_INFO = {
  'あ': ["Ichida kichik lotincha «a» yashiringan — ustidan xoch chizilgan «a».", 'あめ','ame',"yomg'ir"],
  'い': ["Yonma-yon ikki chiziq — ikkita «i» (ii).", 'いぬ','inu','it'],
  'う': ["Tepasida qalpoqcha bor quloq: «u-u» deb eshitadi.", 'うみ','umi','dengiz'],
  'え': ["Bir oyog'ini ko'tarib raqs tushayotgan odam: «E!»", 'えき','eki','bekat'],
  'お': ["«o» harfi va yonida tayoqcha — golf maydonidagi tuynuk va bayroq.", 'おかね','okane','pul'],
  'か': ["Kesuvchi pichoq (katana) va yonida tomchi: «ka!»", 'かさ','kasa','soyabon'],
  'き': ["Eshik kaliti (inglizcha key — «ki»).", 'きって','kitte','pochta markasi'],
  'く': ["Qushning ochilgan tumshug'i: «ku-ku».", 'くち','kuchi',"og'iz"],
  'け': ["Chapda ustun, o'ngda bochka (keg) — «ke».", 'けいたい','keitai','mobil telefon'],
  'こ': ["Ikki baliq (koi) bir-biriga qarab suzyapti.", 'こめ','kome','guruch'],
  'さ': ["Yuqorida xoch, pastda ilgak — «sa»kragan odam.", 'さかな','sakana','baliq'],
  'し': ["Baliq qarmog'i — «shi»l ilgak.", 'しお','shio','tuz'],
  'す': ["Arg'amchidagi halqa — suv (su) aylanmasi.", 'すし','sushi','sushi'],
  'せ': ["Og'zi ochiq odam «se»n deyapti.", 'せんせい','sensei',"o'qituvchi"],
  'そ': ["Zigzag ilon — «so».", 'そら','sora','osmon'],
  'た': ["Chap qismi «t», o'ng qismi «a» ga o'xshaydi — «ta».", 'たまご','tamago','tuxum'],
  'ち': ["5 raqamiga o'xshaydi; cho'zilgan qorin — «chi».", 'ちず','chizu','xarita'],
  'つ': ["Bitta to'lqin — «tsu»nami.", 'つくえ','tsukue','stol (parta)'],
  'て': ["Uzatilgan qo'l (te — qo'l).", 'てがみ','tegami','xat'],
  'と': ["Oyoq barmog'iga (toe) kirgan tikan.", 'とり','tori','qush'],
  'な': ["Xoch va pastda tugun — «na».", 'なつ','natsu','yoz'],
  'に': ["Tizza (knee — «ni») yonida ikki chiziq.", 'にく','niku',"go'sht"],
  'ぬ': ["Ilmoqli lag'mon (noodle) va ustidagi tayoqchalar.", 'ぬの','nuno','mato'],
  'ね': ["Mushuk (neko) — dumi o'ralib qolgan.", 'ねこ','neko','mushuk'],
  'の': ["Taqiq belgisi — «No!»", 'のみもの','nomimono','ichimlik'],
  'は': ["Chap ustun va «ha» deb kulayotgan og'iz. Gapda bog'lovchi bo'lsa «wa» o'qiladi.", 'はな','hana','gul'],
  'ひ': ["Kulayotgan og'iz: «hi-hi».", 'ひと','hito','odam'],
  'ふ': ["Fuji tog'i ustidagi bulutlar — «fu».", 'ふね','fune','kema'],
  'へ': ["Tog' cho'qqisi. Yo'nalish bog'lovchisi bo'lsa «e» o'qiladi.", 'へや','heya','xona'],
  'ほ': ["«は» ga yana bitta chiziq qo'shilgan — «ho».", 'ほん','hon','kitob'],
  'ま': ["Ikki chiziq, pastda halqa — onam (mama) qo'lida tugun.", 'まど','mado','deraza'],
  'み': ["21 raqami kabi — «mi».", 'みず','mizu','suv'],
  'む': ["Sigir «mu» deydi — shoxi va dumi bor.", 'むし','mushi','hasharot'],
  'め': ["Ko'z (me). «ぬ» dan farqi: oxirida halqa yo'q.", 'めがね','megane',"ko'zoynak"],
  'も': ["Baliq ilgagi — yana ko'proq (more) baliq.", 'もも','momo','shaftoli'],
  'や': ["Yak (hayvon) shoxlari — «ya».", 'やま','yama',"tog'"],
  'ゆ': ["Baliq tanasi kabi o'ralgan chiziq — «yu».", 'ゆき','yuki','qor'],
  'よ': ["Ipda osilgan yo-yo o'yinchog'i.", 'よる','yoru','tun'],
  'ら': ["Qalpoqli raper — «ra».", 'らいねん','rainen','kelasi yil'],
  'り': ["Ikki oqim — daryo (river, «ri»).", 'りんご','ringo','olma'],
  'る': ["Oxirida halqa (loop) bor — «ru».", 'はる','haru','bahor'],
  'れ': ["Tizzalab o'tirgan odam. «ね» dan farqi: oxiri halqasiz, tashqariga qayrilgan.", 'れいぞうこ','reizōko','muzlatgich'],
  'ろ': ["«る» ning halqasiz shakli — yo'l (road).", 'いろ','iro','rang'],
  'わ': ["Suv (wa) oqimi. «ね» va «れ» dan farqi: oxiri yumaloq, ichkariga burilgan.", 'わたし','watashi','men'],
  'を': ["Faqat bog'lovchi sifatida ishlatiladi va «o» deb aytiladi.", 'ほんをよむ','hon o yomu','kitob o\'qimoq'],
  'ん': ["Lotincha «n» ga o'xshaydi.", 'みかん','mikan','mandarin'],
  // dakuten / handakuten
  'が':[null,'がっこう','gakkō','maktab'], 'ぎ':[null,'ぎんこう','ginkō','bank'], 'ぐ':[null,'かぐ','kagu','mebel'], 'げ':[null,'げんき','genki','sog\'-salomat'], 'ご':[null,'ごはん','gohan','ovqat; guruch'],
  'ざ':[null,'ざっし','zasshi','jurnal'], 'じ':[null,'じかん','jikan','vaqt'], 'ず':[null,'ちず','chizu','xarita'], 'ぜ':[null,'かぜ','kaze','shamol'], 'ぞ':[null,'かぞく','kazoku','oila'],
  'だ':[null,'だいがく','daigaku','universitet'], 'ぢ':[null,'はなぢ','hanaji','burun qonashi'], 'づ':[null,'つづく','tsuzuku','davom etmoq'], 'で':[null,'でんわ','denwa','telefon'], 'ど':[null,'どこ','doko','qayer'],
  'ば':[null,'ばんごう','bangō','raqam'], 'び':[null,'えび','ebi','krevetka'], 'ぶ':[null,'ぶどう','budō','uzum'], 'べ':[null,'たべもの','tabemono','taom'], 'ぼ':[null,'ぼうし','bōshi','shlyapa'],
  'ぱ':[null,'かんぱい','kanpai','qadah ko\'tarish'], 'ぴ':[null,'えんぴつ','enpitsu','qalam'], 'ぷ':[null,'てんぷら','tenpura','tempura'], 'ぺ':[null,'ぺらぺら','perapera','ravon (gapirmoq)'], 'ぽ':[null,'さんぽ','sanpo','sayr'],
  // yōon
  'きゃ':[null,'きゃく','kyaku','mehmon; mijoz'], 'きゅ':[null,'きゅうり','kyūri','bodring'], 'きょ':[null,'きょう','kyō','bugun'],
  'しゃ':[null,'しゃしん','shashin','surat'], 'しゅ':[null,'しゅくだい','shukudai','uy vazifasi'], 'しょ':[null,'しょくどう','shokudō','oshxona'],
  'ちゃ':[null,'おちゃ','ocha','choy'], 'ちゅ':[null,'ちゅうい','chūi','diqqat'], 'ちょ':[null,'ちょっと','chotto','biroz'],
  'にゃ':[null,'こんにゃく','konnyaku','konnyaku (taom)'], 'にゅ':[null,'にゅういん','nyūin','kasalxonaga yotish'], 'にょ':[null,'にょろにょろ','nyoronyoro','ilonday buralib'],
  'ひゃ':[null,'ひゃく','hyaku','yuz (100)'], 'ひゅ':[null,'ひゅうひゅう','hyūhyū','guvillash (shamol)'], 'ひょ':[null,'ひょう','hyō','jadval; do\'l'],
  'みゃ':[null,'みゃく','myaku','puls'], 'みゅ':[null,null,null,null], 'みょ':[null,'みょうじ','myōji','familiya'],
  'りゃ':[null,'りゃくご','ryakugo','qisqartma'], 'りゅ':[null,'りゅうがくせい','ryūgakusei','xorijlik talaba'], 'りょ':[null,'りょこう','ryokō','sayohat'],
  'ぎゃ':[null,'ぎゃく','gyaku','teskari'], 'ぎゅ':[null,'ぎゅうにゅう','gyūnyū','sut'], 'ぎょ':[null,'きんぎょ','kingyo','oltin baliq'],
  'じゃ':[null,'じゃま','jama','xalaqit'], 'じゅ':[null,'じゅぎょう','jugyō','dars'], 'じょ':[null,'じょうず','jōzu','mohir, usta'],
  'びゃ':[null,'さんびゃく','sanbyaku','uch yuz'], 'びゅ':[null,null,null,null], 'びょ':[null,'びょういん','byōin','kasalxona'],
  'ぴゃ':[null,'はっぴゃく','happyaku','sakkiz yuz'], 'ぴゅ':[null,null,null,null], 'ぴょ':[null,'はっぴょう','happyō','taqdimot'],
};

/* Katakana: [mnemonic (uz), example word, romaji, uz meaning] — mostly loanwords */
const KATA_INFO = {
  'ア': ["Arra (ax) ko'rinishi — tepada bayroq, pastga tushgan dasta.", 'アイス','aisu','muzqaymoq'],
  'イ': ["Burgut (eagle) qanoti — qiya chiziq va ustun.", 'イヤホン','iyahon','quloqchin'],
  'ウ': ["«う» ning burchakli shakli — qalpoqli quloq.", 'ウイルス','uirusu','virus'],
  'エ': ["Lift (elevator) relsi — I shaklidagi temir.", 'エレベーター','erebētā','lift'],
  'オ': ["Opera xonandasi qo'llarini yoygan.", 'オレンジ','orenji','apelsin'],
  'カ': ["«か» ning tomchisiz shakli.", 'カメラ','kamera','kamera'],
  'キ': ["Kalit (key) — ikki tishli.", 'キロ','kiro','kilo'],
  'ク': ["Kukuning ochiq tumshug'i. «タ» dan farqi: ichida chiziq yo'q.", 'クラス','kurasu','sinf'],
  'ケ': ["Bir bo'lak tort (kek) — «ke».", 'ケーキ','kēki','tort'],
  'コ': ["Xona burchagi (corner) — «ko».", 'コーヒー','kōhī','qahva'],
  'サ': ["Ikki ustunli darvoza — «sa».", 'サッカー','sakkā','futbol'],
  'シ': ["Kulayotgan yuz: ikki ko'z CHAPda, oxirgi chiziq PASTdan yuqoriga.", 'タクシー','takushī','taksi'],
  'ス': ["Suzayotgan odam — «su».", 'スープ','sūpu',"sho'rva"],
  'セ': ["«せ» ning soddalashgan shakli.", 'セーター','sētā','sviter'],
  'ソ': ["Ikki tomchi yuqorida, uzun chiziq YUQORIdan pastga — «so».", 'ソファー','sofā','divan'],
  'タ': ["«ク» ichida qo'shimcha chiziq — «ta».", 'タオル','taoru','sochiq'],
  'チ': ["«ち» ning burchakli shakli; tepasida qiya chiziq.", 'チーズ','chīzu','pishloq'],
  'ツ': ["Ikki ko'z TEPADA, uzun chiziq YUQORIdan pastga — «tsu».", 'ツアー','tsuā','tur (sayohat)'],
  'テ': ["Telegraf ustuni — «te».", 'テレビ','terebi','televizor'],
  'ト': ["Totem ustuni va unga osilgan narsa.", 'トマト','tomato','pomidor'],
  'ナ': ["Xoch — pichoq (knife, «na»).", 'バナナ','banana','banan'],
  'ニ': ["Ikki chiziq — «に» ning o'ng qismi.", 'テニス','tenisu','tennis'],
  'ヌ': ["Ikki tayoqcha bilan lag'mon (noodle). «ス» dan farqi: kichik qo'shimcha chiziq.", 'ヌードル','nūdoru',"lag'mon"],
  'ネ': ["«ね» ning soddalashgan shakli — mushuk (neko).", 'ネクタイ','nekutai','galstuk'],
  'ノ': ["Bitta qiya chiziq — «No».", 'ノート','nōto','daftar'],
  'ハ': ["Ikki chiziq — «ha-ha» kulgisi.", 'ハンバーガー','hanbāgā','gamburger'],
  'ヒ': ["«ひ» ning yarmi — «hi».", 'ヒーター','hītā','isitgich'],
  'フ': ["«ふ» ning yuqori qismi — «fu».", 'フランス','Furansu','Fransiya'],
  'ヘ': ["«へ» bilan deyarli bir xil.", 'ヘリコプター','herikoputā','vertolyot'],
  'ホ': ["«ほ» ning o'ng qismi — «ho».", 'ホテル','hoteru','mehmonxona'],
  'マ': ["Onaning (mama) burni — «ma».", 'マスク','masuku','niqob'],
  'ミ': ["Uchta qiya chiziq — «mi».", 'ミルク','miruku','sut'],
  'ム': ["Sigir burni — «mu».", 'ゲーム','gēmu',"o'yin"],
  'メ': ["Ko'z (me) ustidagi X belgisi.", 'メール','mēru','elektron xat'],
  'モ': ["«も» ga o'xshaydi — «mo».", 'メモ','memo','qayd'],
  'ヤ': ["«や» ga o'xshaydi — yak shoxi.", 'タイヤ','taiya','shina'],
  'ユ': ["U-burilish belgisi — «yu».", 'ユーロ','yūro','yevro'],
  'ヨ': ["Teskari «E» — «yo».", 'ヨーグルト','yōguruto','yogurt'],
  'ラ': ["Qalpoqli raper — «ra».", 'ラジオ','rajio','radio'],
  'リ': ["«り» bilan bir xil — daryo.", 'リモコン','rimokon','pult'],
  'ル': ["Ikki oyoq — yurish qoidasi (rule, «ru»).", 'ルール','rūru','qoida'],
  'レ': ["Burchakli lazer nuri — «re».", 'レストラン','resutoran','restoran'],
  'ロ': ["Kvadrat — robotning boshi.", 'ロボット','robotto','robot'],
  'ワ': ["Vino qadahi (wine) — «wa».", 'ワイン','wain','vino'],
  'ヲ': ["Hozirgi zamonda deyarli ishlatilmaydi.", null, null, null],
  'ン': ["Bitta ko'z va chiziq PASTdan yuqoriga — «n». (ソ da chiziq yuqoridan tushadi.)", 'パン','pan','non'],
  'ガ':[null,'ガム','gamu','saqich'], 'ギ':[null,'ギター','gitā','gitara'], 'グ':[null,'グラス','gurasu','stakan'], 'ゲ':[null,'ゲーム','gēmu',"o'yin"], 'ゴ':[null,'ゴルフ','gorufu','golf'],
  'ザ':[null,'デザート','dezāto','desert'], 'ジ':[null,'ジュース','jūsu','sharbat'], 'ズ':[null,'チーズ','chīzu','pishloq'], 'ゼ':[null,'ゼロ','zero','nol'], 'ゾ':[null,'ゾーン','zōn','zona'],
  'ダ':[null,'ダンス','dansu','raqs'], 'ヂ':[null,null,null,null], 'ヅ':[null,null,null,null], 'デ':[null,'デパート','depāto','univermag'], 'ド':[null,'ドア','doa','eshik'],
  'バ':[null,'バス','basu','avtobus'], 'ビ':[null,'ビル','biru','bino'], 'ブ':[null,'ブラシ','burashi',"cho'tka"], 'ベ':[null,'ベッド','beddo','karavot'], 'ボ':[null,'ボール','bōru',"to'p"],
  'パ':[null,'パン','pan','non'], 'ピ':[null,'ピアノ','piano','pianino'], 'プ':[null,'プール','pūru','basseyn'], 'ペ':[null,'ペン','pen','ruchka'], 'ポ':[null,'ポスト','posuto','pochta qutisi'],
  'キャ':[null,'キャンプ','kyanpu','lager'], 'シャ':[null,'シャツ','shatsu',"ko'ylak"], 'シュ':[null,'シューズ','shūzu','oyoq kiyim'], 'ショ':[null,'ショップ','shoppu',"do'kon"],
  'チャ':[null,'チャンス','chansu','imkoniyat'], 'チュ':[null,'チューブ','chūbu','naycha'], 'チョ':[null,'チョコレート','chokorēto','shokolad'],
  'ニュ':[null,'ニュース','nyūsu','yangiliklar'], 'ミュ':[null,'ミュージック','myūjikku','musiqa'], 'リュ':[null,'リュック','ryukku','ryukzak'],
  'ギャ':[null,'ギャラリー','gyararī','galereya'], 'ジャ':[null,'ジャム','jamu','murabbo'], 'ジョ':[null,'ジョギング','jogingu','yugurish'],
  'ビュ':[null,'ビュッフェ','byuffe','shved stoli'], 'ピュ':[null,'コンピューター','konpyūtā','kompyuter'],
};

// Groups of easily confused characters
const CONFUSABLE = [
  { set: ['シ','ツ'], tip: "シ: ko'zlar chapda, chiziq pastdan yuqoriga. ツ: ko'zlar tepada, chiziq yuqoridan pastga." },
  { set: ['ソ','ン'], tip: "ソ: uzun chiziq yuqoridan pastga. ン: chiziq pastdan yuqoriga ko'tariladi." },
  { set: ['シ','ン','ツ','ソ'], tip: "Ko'zlar soni va chiziq yo'nalishiga qarang." },
  { set: ['ね','れ','わ'], tip: "ね: oxirida halqa. れ: oxiri tashqariga qayrilgan. わ: oxiri yumaloq, ichkariga." },
  { set: ['さ','ち'], tip: "さ: yoy o'ngga ochiq (pastda alohida chiziq). ち: yoy chapga ochiq, raqam 5 kabi." },
  { set: ['き','さ'], tip: "き: tepada ikkita gorizontal chiziq. さ: bitta." },
  { set: ['ぬ','め'], tip: "ぬ: oxirida halqa bor. め: halqasiz." },
  { set: ['る','ろ'], tip: "る: pastda halqa. ろ: halqasiz." },
  { set: ['は','ほ'], tip: "ほ: tepada qo'shimcha chiziq bor." },
  { set: ['い','こ','り'], tip: "い: ikki tik chiziq. こ: ikki yotiq chiziq. り: o'ngdagisi uzun." },
  { set: ['あ','お'], tip: "あ: tepada yotiq + tik chiziq kesishadi. お: chiziq tik, o'ngda nuqta." },
  { set: ['ク','ケ','タ'], tip: "ク: oddiy. ケ: o'ng tomonda chiziq chiqib turadi. タ: ichida qo'shimcha chiziq." },
  { set: ['ウ','ワ','フ'], tip: "ウ: tepada nuqta + ikki tomonlama qalpoq. ワ: chapda tik chiziq. フ: chap tomoni ochiq." },
  { set: ['ア','マ'], tip: "ア: dasta tik pastga tushadi. マ: ichida kichik qiya chiziq." },
  { set: ['コ','ユ'], tip: "コ: o'ng tomoni yopiq. ユ: pastki chiziq o'ngga chiqib turadi." },
  { set: ['チ','テ'], tip: "チ: tepasi qiya chiziq. テ: tepada ikkita yotiq chiziq." },
  { set: ['ス','ヌ'], tip: "ヌ: o'rtada qo'shimcha kichik chiziq bor." },
  { set: ['ナ','メ'], tip: "ナ: xoch kabi, tik chiziq. メ: X kabi qiya." },
];

// Katakana loanword rules
const LOAN_RULES = [
  { rule: "Cho'ziq unli → ー belgisi", ex: [['コーヒー','kōhī','coffee'],['ケーキ','kēki','cake'],['ノート','nōto','note(book)']] },
  { rule: "So'z oxiridagi undoshga «u» qo'shiladi (t/d dan keyin «o»)", ex: [['バス','basu','bus'],['テスト','tesuto','test'],['ベッド','beddo','bed']] },
  { rule: "L va R → ra-qatori (ラ リ ル レ ロ)", ex: [['レモン','remon','lemon'],['ラジオ','rajio','radio'],['ホテル','hoteru','hotel']] },
  { rule: "Qisqa unlidan keyingi qattiq undosh → kichik ッ", ex: [['カップ','kappu','cup'],['サッカー','sakkā','soccer'],['ロボット','robotto','robot']] },
  { rule: "-er / -or / -ar oxiri → ー", ex: [['コンピューター','konpyūtā','computer'],['エレベーター','erebētā','elevator'],['センター','sentā','center']] },
  { rule: "V → ba-qatori (ba bi bu be bo)", ex: [['ビデオ','bideo','video'],['テレビ','terebi','TV (television)'],['バイオリン','baiorin','violin']] },
  { rule: "F → ファ フィ フ フェ フォ", ex: [['フォーク','fōku','fork'],['ファイル','fairu','file'],['カフェ','kafe','café']] },
  { rule: "Ti / Di → ティ / ディ", ex: [['パーティー','pātī','party'],['ディズニー','Dizunī','Disney'],['ティッシュ','tisshu','tissue']] },
  { rule: "Th → sa / za qatori", ex: [['スリー','surī','three'],['ヘルス','herusu','health'],['マラソン','marason','marathon']] },
];

// Common loanwords for practice
const LOANWORDS = [
  ['アイス','aisu','muzqaymoq'],['アイスクリーム','aisukurīmu','muzqaymoq'],['アルバイト','arubaito',"yarim kunlik ish"],['インターネット','intānetto','internet'],
  ['エアコン','eakon','konditsioner'],['エレベーター','erebētā','lift'],['オレンジ','orenji','apelsin'],['カメラ','kamera','kamera'],['カレー','karē','karri'],
  ['ケーキ','kēki','tort'],['ゲーム','gēmu',"o'yin"],['コーヒー','kōhī','qahva'],['コンビニ','konbini',"24 soatlik do'kon"],['サッカー','sakkā','futbol'],
  ['シャツ','shatsu',"ko'ylak"],['ジュース','jūsu','sharbat'],['スーパー','sūpā','supermarket'],['スプーン','supūn','qoshiq'],['スマホ','sumaho','smartfon'],
  ['セーター','sētā','sviter'],['タクシー','takushī','taksi'],['チーズ','chīzu','pishloq'],['チョコレート','chokorēto','shokolad'],['テスト','tesuto','test, imtihon'],
  ['テレビ','terebi','televizor'],['トイレ','toire','hojatxona'],['トマト','tomato','pomidor'],['ドア','doa','eshik'],['ニュース','nyūsu','yangiliklar'],
  ['ネクタイ','nekutai','galstuk'],['ノート','nōto','daftar'],['パスポート','pasupōto','pasport'],['パソコン','pasokon','kompyuter'],['バス','basu','avtobus'],
  ['バナナ','banana','banan'],['パン','pan','non'],['ビール','bīru','pivo'],['ビル','biru','bino'],['ホテル','hoteru','mehmonxona'],
  ['ミルク','miruku','sut'],['メール','mēru','elektron xat'],['メニュー','menyū','menyu'],['ラーメン','rāmen','ramen'],['レストラン','resutoran','restoran'],
  ['ロボット','robotto','robot'],['ワイン','wain','vino'],
];

/* ---------- derived structures ---------- */
const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

const KANA = (() => {
  const list = []; const byChar = {};
  const add = (script, group, row, ch, ro) => {
    const c = script === 'kata' ? toKata(ch) : ch;
    const info = (script === 'kata' ? KATA_INFO : HIRA_INFO)[c] || [null, null, null, null];
    let mn = info[0];
    if (!mn && group === 'daku') {
      const base = c.normalize('NFD')[0];
      const hand = /[ぱぴぷぺぽパピプペポ]/.test(c);
      mn = `${base} + ${hand ? '゜ (handakuten — doiracha)' : '゛ (dakuten — ikki nuqta)'} = ${c}. ${hand ? "«h» tovushi «p» ga aylanadi." : "Tovush jarangli bo'ladi."}`;
    }
    if (!mn && group === 'yoon') mn = `${c[0]} + kichik ${c[1]} = bitta bo'g'in «${ro}». Ikki bo'g'in emas, bir nafasda aytiladi.`;
    if (c === 'を' || c === 'ヲ') ro = 'o';
    const item = { id: 'k:' + c, ch: c, ro, script, group, row, mn, ex: info[1] ? { w: info[1], r: info[2], m: info[3] } : null };
    list.push(item); byChar[c] = item; return item;
  };
  const rows = { hira: [], kata: [] };
  for (const script of ['hira', 'kata']) {
    for (const [group, src] of [['basic', KANA_BASIC], ['daku', KANA_DAKU], ['yoon', KANA_YOON]]) {
      for (const r of src) {
        const slots = r.chars.map(x => x ? add(script, group, r.id, x[0], x[1]) : null);
        rows[script].push({ id: r.id, group, slots });
      }
    }
  }
  return { list, byChar, rows };
})();

// Lesson sequence (row-by-row)
const KANA_LESSONS = (() => {
  const plan = [
    ['a', ['a']], ['k', ['k']], ['s', ['s']], ['t', ['t']], ['n', ['n']], ['h', ['h']], ['m', ['m']],
    ['yr', ['y', 'r']], ['wn', ['w', 'nn']],
    ['gz', ['g', 'z']], ['dbp', ['d', 'b', 'p']],
    ['y1', ['ky', 'sh', 'ch', 'ny', 'hy', 'my']], ['y2', ['ry', 'gy', 'j', 'by', 'py']],
  ];
  const out = {};
  for (const script of ['hira', 'kata']) {
    out[script] = plan.map(([id, rowIds], i) => {
      const chars = KANA.list.filter(k => k.script === script && rowIds.includes(k.row) &&
        !(k.ch === 'ぢ' || k.ch === 'づ' || k.ch === 'ヂ' || k.ch === 'ヅ'));
      const label = chars.slice(0, 5).map(c => c.ch).join(' ') + (chars.length > 5 ? ' …' : '');
      return { id: script + i, idx: i, rowIds, chars, label };
    });
  }
  return out;
})();
