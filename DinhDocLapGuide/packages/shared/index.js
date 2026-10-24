// Dữ liệu và nghiệp vụ dùng chung cho Web + Mobile.
// Nội dung thuyết minh ngắn gọn, dùng cho demo. Cần đối chiếu với tư liệu chính thức
// của Hội trường Thống Nhất trước khi phát hành thật.

export const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", native: "Tiếng Việt", flag: "🇻🇳", speech: "vi-VN" },
  { code: "en", label: "English", native: "English", flag: "🇬🇧", speech: "en-US" },
  { code: "zh", label: "中文", native: "中文（简体）", flag: "🇨🇳", speech: "zh-CN" },
  { code: "ja", label: "日本語", native: "日本語", flag: "🇯🇵", speech: "ja-JP" },
  { code: "ko", label: "한국어", native: "한국어", flag: "🇰🇷", speech: "ko-KR" }
];

import { summaries, palaceMore } from "./places.js";

export const DEFAULT_LANG = "vi";

export const ui = {
  vi: {
    map: "Bản đồ", openMaps: "Mở Google Maps", walkFromPalace: "Chỉ đường đi bộ từ Dinh", mapNote: "Vị trí chỉ mang tính ước lượng.", palaceName: "Dinh Độc Lập", palaceAddress: "135 Nam Kỳ Khởi Nghĩa",
    about: "Giới thiệu",
    appName: "Thuyết minh Dinh Độc Lập",
    tagline: "Hội trường Thống Nhất · 135 Nam Kỳ Khởi Nghĩa, TP. Hồ Chí Minh",
    heroTitle: "Nghe câu chuyện của Dinh Độc Lập",
    heroText: "Chọn ngôn ngữ, chọn điểm tham quan và nhấn nghe. Thuyết minh được đọc bằng giọng nói của thiết bị.",
    language: "Ngôn ngữ", stops: "Điểm tham quan", play: "Nghe", pause: "Tạm dừng", resume: "Tiếp tục", stop: "Dừng",
    next: "Điểm tiếp", prev: "Điểm trước", speed: "Tốc độ", nowPlaying: "Đang phát", floor: "Vị trí",
    startTour: "Bắt đầu tham quan", noVoice: "Thiết bị chưa có giọng đọc cho ngôn ngữ này. Hãy cài giọng đọc trong phần cài đặt hệ thống.",
    unsupported: "Trình duyệt này không hỗ trợ đọc thuyết minh.", transcript: "Nội dung thuyết minh", search: "Tìm điểm tham quan...",
    empty: "Không tìm thấy điểm phù hợp.", min: "phút", of: "/", footer: "Bản demo · giọng đọc do thiết bị cung cấp"
  },
  en: {
    map: "Map", openMaps: "Open in Google Maps", walkFromPalace: "Walking directions from the Palace", mapNote: "Locations are approximate.", palaceName: "Independence Palace", palaceAddress: "135 Nam Ky Khoi Nghia",
    about: "About",
    appName: "Independence Palace Audio Guide",
    tagline: "Reunification Palace · 135 Nam Ky Khoi Nghia, Ho Chi Minh City",
    heroTitle: "Hear the story of Independence Palace",
    heroText: "Pick a language, choose a stop and press listen. Narration is read aloud by your device's voice.",
    language: "Language", stops: "Stops", play: "Listen", pause: "Pause", resume: "Resume", stop: "Stop",
    next: "Next stop", prev: "Previous", speed: "Speed", nowPlaying: "Now playing", floor: "Location",
    startTour: "Start the tour", noVoice: "No voice for this language was found on your device. Install one in system settings.",
    unsupported: "This browser does not support speech narration.", transcript: "Transcript", search: "Search stops...",
    empty: "No matching stops.", min: "min", of: "/", footer: "Demo · voices are provided by your device"
  },
  zh: {
    map: "地图", openMaps: "在谷歌地图中打开", walkFromPalace: "从独立宫步行路线", mapNote: "位置仅为大致范围。", palaceName: "独立宫", palaceAddress: "南圻起义路135号",
    about: "简介",
    appName: "独立宫语音导览",
    tagline: "统一宫 · 胡志明市南圻起义路135号",
    heroTitle: "聆听独立宫的故事",
    heroText: "选择语言和景点，点击收听。解说由设备自带语音朗读。",
    language: "语言", stops: "景点", play: "收听", pause: "暂停", resume: "继续", stop: "停止",
    next: "下一站", prev: "上一站", speed: "语速", nowPlaying: "正在播放", floor: "位置",
    startTour: "开始游览", noVoice: "设备上没有该语言的语音，请在系统设置中安装。",
    unsupported: "此浏览器不支持语音朗读。", transcript: "解说文字", search: "搜索景点...",
    empty: "没有匹配的景点。", min: "分钟", of: "/", footer: "演示版 · 语音由设备提供"
  },
  ja: {
    map: "地図", openMaps: "Googleマップで開く", walkFromPalace: "独立宮殿からの徒歩ルート", mapNote: "位置はおおよそのものです。", palaceName: "独立宮殿", palaceAddress: "ナムキーコイギア通り135番地",
    about: "概要",
    appName: "独立宮殿 音声ガイド",
    tagline: "統一会堂 · ホーチミン市 ナムキーコイギア通り135番地",
    heroTitle: "独立宮殿の物語を聞こう",
    heroText: "言語とスポットを選んで再生を押してください。ガイドは端末の音声で読み上げられます。",
    language: "言語", stops: "見どころ", play: "再生", pause: "一時停止", resume: "再開", stop: "停止",
    next: "次へ", prev: "前へ", speed: "速度", nowPlaying: "再生中", floor: "場所",
    startTour: "ツアーを始める", noVoice: "この言語の音声が端末にありません。システム設定でインストールしてください。",
    unsupported: "このブラウザは読み上げに対応していません。", transcript: "ガイド原稿", search: "スポットを検索...",
    empty: "該当するスポットがありません。", min: "分", of: "/", footer: "デモ版 · 音声は端末が提供します"
  },
  ko: {
    map: "지도", openMaps: "구글 지도에서 열기", walkFromPalace: "독립궁에서 도보 길찾기", mapNote: "위치는 대략적인 것입니다.", palaceName: "독립궁", palaceAddress: "남끼코이응이아 135번지",
    about: "소개",
    appName: "독립궁 오디오 가이드",
    tagline: "통일궁 · 호찌민시 남끼코이응이아 135번지",
    heroTitle: "독립궁의 이야기를 들어보세요",
    heroText: "언어와 장소를 고르고 재생을 누르세요. 해설은 기기의 음성으로 읽어 줍니다.",
    language: "언어", stops: "관람 장소", play: "듣기", pause: "일시정지", resume: "계속", stop: "정지",
    next: "다음 장소", prev: "이전", speed: "속도", nowPlaying: "재생 중", floor: "위치",
    startTour: "투어 시작", noVoice: "이 언어의 음성이 기기에 없습니다. 시스템 설정에서 설치해 주세요.",
    unsupported: "이 브라우저는 음성 읽기를 지원하지 않습니다.", transcript: "해설 원문", search: "장소 검색...",
    empty: "일치하는 장소가 없습니다.", min: "분", of: "/", footer: "데모 · 음성은 기기에서 제공됩니다"
  }
};

// Mỗi điểm: id, icon, floor (đa ngữ), title (đa ngữ), text (đa ngữ)
const palaceCore = [
  {
    id: "gate", icon: "🚩", category: "palace",
    floor: { vi: "Sân trước & cổng chính", en: "Front lawn & main gate", zh: "前庭与正门", ja: "前庭と正門", ko: "앞마당과 정문" },
    title: { vi: "Cổng chính & xe tăng", en: "Main gate & tanks", zh: "正门与坦克", ja: "正門と戦車", ko: "정문과 탱크" },
    text: {
      vi: "Bạn đang đứng trước cổng chính của Dinh Độc Lập. Trưa ngày 30 tháng 4 năm 1975, xe tăng 390 của Quân giải phóng húc đổ cổng này, cùng xe tăng 843 tiến vào khuôn viên Dinh. Sự kiện đó đánh dấu thời khắc kết thúc chiến tranh và thống nhất đất nước. Ngày nay, hai chiếc xe tăng được trưng bày trong khuôn viên để nhắc lại khoảnh khắc lịch sử ấy.",
      en: "You are standing at the main gate of Independence Palace. At midday on 30 April 1975, tank 390 of the Liberation Army crashed through this gate, and with tank 843 entered the grounds. That moment marked the end of the war and the reunification of the country. Today, two tanks are displayed in the grounds to recall that historic moment.",
      zh: "您现在站在独立宫的正门前。1975年4月30日中午，解放军的390号坦克撞开了这道大门，并与843号坦克一起冲入宫内。这一刻标志着战争的结束和国家的统一。如今，两辆坦克陈列在院内，让人们回想那个历史时刻。",
      ja: "ここは独立宮殿の正門前です。1975年4月30日の正午、解放軍の戦車390号がこの門を突き破り、843号とともに敷地内に進入しました。この出来事は戦争の終結と国家統一の瞬間を示しています。現在、敷地内には2両の戦車が展示され、歴史的な瞬間を伝えています。",
      ko: "지금 독립궁의 정문 앞에 서 계십니다. 1975년 4월 30일 정오, 해방군의 390호 탱크가 이 문을 부수고 843호 탱크와 함께 궁 안으로 진입했습니다. 이 순간은 전쟁의 종결과 나라의 통일을 상징합니다. 오늘날 경내에는 탱크 두 대가 전시되어 그 역사적인 순간을 전하고 있습니다."
    }
  },
  {
    id: "history", icon: "🏛️", category: "palace",
    floor: { vi: "Sảnh chính", en: "Main lobby", zh: "主厅", ja: "メインロビー", ko: "중앙 로비" },
    title: { vi: "Lịch sử Dinh", en: "History of the Palace", zh: "宫殿历史", ja: "宮殿の歴史", ko: "궁의 역사" },
    text: {
      vi: "Nơi đây từng là Dinh Norodom, xây dựng từ năm 1868 làm nơi ở của Toàn quyền Pháp. Ngày 27 tháng 2 năm 1962, dinh cũ bị máy bay ném bom hư hại nặng. Kiến trúc sư Ngô Viết Thụ thiết kế công trình mới, hoàn thành năm 1966 và được đặt tên là Dinh Độc Lập. Sau năm 1975, nơi này được gọi là Hội trường Thống Nhất.",
      en: "This site was once Norodom Palace, built from 1868 as the residence of the French governor. On 27 February 1962, the old palace was heavily damaged in an air attack. Architect Ngo Viet Thu designed the new building, completed in 1966 and named Independence Palace. After 1975 it became known as Reunification Hall.",
      zh: "这里曾是诺罗敦宫，始建于1868年，是法国总督的官邸。1962年2月27日，旧宫在空袭中严重受损。建筑师吴越树设计了新建筑，于1966年竣工，命名为独立宫。1975年以后，这里被称为统一会堂。",
      ja: "この場所はかつてノロドム宮殿で、1868年にフランス総督の官邸として建てられました。1962年2月27日、旧宮殿は空爆で大きな被害を受けました。建築家ゴ・ヴィエト・トゥーが新しい建物を設計し、1966年に完成して独立宮殿と名付けられました。1975年以降は統一会堂と呼ばれています。",
      ko: "이곳은 1868년 프랑스 총독의 관저로 지어진 노로돔 궁이 있던 자리입니다. 1962년 2월 27일 옛 궁은 공습으로 크게 파손되었습니다. 건축가 응오비엣투가 새 건물을 설계하여 1966년에 완공했고 독립궁이라 이름 붙였습니다. 1975년 이후에는 통일회관이라 불립니다."
    }
  },
  {
    id: "credentials", icon: "📜", category: "palace",
    floor: { vi: "Khu tiếp tân & nghi lễ", en: "Reception & ceremonial area", zh: "接待与礼仪区", ja: "応接・儀礼エリア", ko: "접견·의전 구역" },
    title: { vi: "Phòng Quốc thư", en: "Credentials Room", zh: "国书厅", ja: "信任状の間", ko: "신임장 접수실" },
    text: {
      vi: "Đây là Phòng Quốc thư, nơi Tổng thống tiếp các đại sứ đến trình quốc thư. Không gian trang trọng với bàn ghế bọc lụa và những bức tranh sơn mài mang đậm phong cách Việt Nam. Hãy chú ý cách bố trí đối xứng, thể hiện tính nghi lễ của căn phòng.",
      en: "This is the Credentials Room, where the President received ambassadors presenting their credentials. The formal space features silk-upholstered furniture and lacquer paintings in a distinctly Vietnamese style. Notice the symmetrical layout, which reflects the ceremonial nature of the room.",
      zh: "这里是国书厅，总统在此接见前来递交国书的大使。庄重的空间里摆放着丝绸软包的桌椅和富有越南风格的漆画。请留意对称的布局，体现了这个房间的礼仪性质。",
      ja: "こちらは信任状の間で、大統領が信任状を提出する大使を迎えた部屋です。格式ある空間には、絹張りの家具とベトナムらしい漆絵が飾られています。左右対称の配置に、儀礼の場としての性格が表れています。",
      ko: "이곳은 신임장 접수실로, 대통령이 신임장을 제정하러 온 대사들을 맞이하던 방입니다. 격식 있는 공간에 비단으로 감싼 가구와 베트남 특유의 칠화가 놓여 있습니다. 대칭적인 배치에서 이 방의 의전적인 성격을 느낄 수 있습니다."
    }
  },
  {
    id: "reception", icon: "🥂", category: "palace",
    floor: { vi: "Khu tiếp tân & nghi lễ", en: "Reception & ceremonial area", zh: "接待与礼仪区", ja: "応接・儀礼エリア", ko: "접견·의전 구역" },
    title: { vi: "Phòng khánh tiết", en: "Grand Reception Hall", zh: "大宴会厅", ja: "大広間", ko: "대연회장" },
    text: {
      vi: "Phòng khánh tiết là không gian rộng lớn dành cho các buổi lễ và tiệc chiêu đãi lớn. Trần cao, đèn chùm và khoảng không thoáng tạo cảm giác uy nghi. Công trình được thiết kế để đón gió và ánh sáng tự nhiên, phù hợp với khí hậu nhiệt đới.",
      en: "The Grand Reception Hall is a large space for ceremonies and major banquets. High ceilings, chandeliers and open space create a sense of grandeur. The building was designed to welcome breezes and natural light, suited to the tropical climate.",
      zh: "大宴会厅是举办典礼和大型宴请的宽敞空间。高高的天花板、吊灯和开阔的空间营造出庄严的气氛。建筑设计注重通风和自然采光，适应热带气候。",
      ja: "大広間は式典や大規模な晩餐会のための広い空間です。高い天井、シャンデリア、開放的な空間が荘厳な雰囲気を生み出しています。建物は風と自然光を取り入れる設計で、熱帯の気候に合っています。",
      ko: "대연회장은 각종 의식과 대규모 연회를 위한 넓은 공간입니다. 높은 천장과 샹들리에, 탁 트인 공간이 웅장한 분위기를 자아냅니다. 건물은 바람과 자연광을 받아들이도록 설계되어 열대 기후에 잘 맞습니다."
    }
  },
  {
    id: "cabinet", icon: "🗂️", category: "palace",
    floor: { vi: "Khu tiếp tân & làm việc", en: "Reception & working area", zh: "接待与办公区", ja: "応接・執務エリア", ko: "접견·집무 구역" },
    title: { vi: "Phòng họp Nội các", en: "Cabinet Meeting Room", zh: "内阁会议室", ja: "閣議室", ko: "내각 회의실" },
    text: {
      vi: "Đây là phòng họp Nội các, nơi diễn ra các cuộc họp của Hội đồng Bộ trưởng và Nội các chính quyền Sài Gòn. Chiếc bàn họp hình chữ nhật cùng hệ thống ghế xếp ngay ngắn cho thấy không khí làm việc chính thức. Căn phòng gắn với nhiều quyết định chính trị và quân sự của thời kỳ này.",
      en: "This is the Cabinet Meeting Room, where the Saigon government discussed important matters. The long rectangular table and neatly arranged chairs convey a formal working atmosphere. The room is linked to many political and military decisions of that period.",
      zh: "这里是内阁会议室，西贡政府在此商议重要事务。长方形会议桌和整齐排列的座椅体现出正式的办公氛围。这个房间与那一时期的许多政治和军事决策相关联。",
      ja: "こちらは閣議室で、サイゴン政府が重要事項を協議した場所です。長方形の会議卓と整然と並んだ椅子が、公式な執務の雰囲気を伝えています。この部屋は当時の多くの政治的・軍事的決定と結びついています。",
      ko: "이곳은 내각 회의실로, 사이공 정부가 중요한 사안을 논의하던 곳입니다. 긴 직사각형 탁자와 가지런한 의자에서 공식적인 업무 분위기가 느껴집니다. 이 방은 당시의 많은 정치·군사적 결정과 연결되어 있습니다."
    }
  },
  {
    id: "rooftop", icon: "🚁", category: "palace",
    floor: { vi: "Tầng thượng", en: "Rooftop", zh: "屋顶", ja: "屋上", ko: "옥상" },
    title: { vi: "Sân thượng & trực thăng", en: "Rooftop & helicopter", zh: "屋顶与直升机", ja: "屋上とヘリコプター", ko: "옥상과 헬기" },
    text: {
      vi: "Tầng thượng có sân đỗ trực thăng, nơi hiện đang trưng bày một chiếc trực thăng. Từ đây, bạn có thể nhìn xuống khuôn viên rộng lớn và thành phố xung quanh. Trên mái còn dấu vết vụ ném bom ngày 8 tháng 4 năm 1975 của phi công Nguyễn Thành Trung; quả bom chỉ nổ một phần.",
      en: "The rooftop has a helipad, where a helicopter is now on display. From here you can look down on the broad grounds and the surrounding city. The roof also bears traces of the 8 April 1975 bombing by pilot Nguyen Thanh Trung; the bomb only partly exploded.",
      zh: "屋顶设有直升机停机坪，现在陈列着一架直升机。在这里可以俯瞰宽阔的院落和周围的城市。屋顶上还留有飞行员阮成忠1975年4月8日轰炸的痕迹，那枚炸弹只有部分爆炸。",
      ja: "屋上にはヘリポートがあり、現在はヘリコプターが展示されています。ここから広い敷地と周囲の街を見渡せます。屋上には、1975年4月8日にグエン・タイン・チュン操縦士が行った爆撃の痕跡も残っており、爆弾は一部しか爆発しませんでした。",
      ko: "옥상에는 헬기장이 있으며 현재 헬리콥터가 전시되어 있습니다. 이곳에서 넓은 경내와 주변 도시를 내려다볼 수 있습니다. 옥상에는 1975년 4월 8일 응우옌탄쭝 조종사의 폭격 흔적도 남아 있으며, 폭탄은 일부만 터졌습니다."
    }
  },
  {
    id: "bunker", icon: "📡", category: "palace",
    floor: { vi: "Tầng hầm", en: "Basement", zh: "地下层", ja: "地下", ko: "지하" },
    title: { vi: "Hầm chỉ huy", en: "Command bunker", zh: "地下指挥所", ja: "地下司令室", ko: "지하 지휘소" },
    text: {
      vi: "Bạn đang ở tầng hầm kiên cố, được xây với tường bê tông dày để chống bom đạn. Nơi đây có phòng tác chiến, hệ thống liên lạc và bản đồ quân sự. Không gian chật hẹp, ánh đèn lạnh tạo nên cảm giác rất khác so với các phòng tiếp tân phía trên.",
      en: "You are in the fortified basement, built with thick concrete walls to withstand bombing. It contains an operations room, communications equipment and military maps. The cramped space and cold lighting feel very different from the reception rooms above.",
      zh: "您现在位于坚固的地下层，用厚实的混凝土墙建造，可抵御轰炸。这里设有作战室、通信设备和军事地图。狭小的空间和冷色的灯光，与楼上的接待厅感觉截然不同。",
      ja: "ここは堅固な地下階で、爆撃に耐えるよう厚いコンクリートの壁で造られています。作戦室、通信設備、軍事地図があります。狭い空間と冷たい照明は、上階の応接室とはまったく違う雰囲気です。",
      ko: "지금 계신 곳은 폭격에 견디도록 두꺼운 콘크리트 벽으로 지은 견고한 지하층입니다. 작전실과 통신 장비, 군사 지도가 있습니다. 좁은 공간과 차가운 조명은 위층의 접견실과 사뭇 다른 느낌을 줍니다."
    }
  },
  {
    id: "reunification", icon: "🕊️", category: "palace",
    floor: { vi: "Khuôn viên", en: "Grounds", zh: "院内", ja: "敷地内", ko: "경내" },
    title: { vi: "Hội trường Thống Nhất", en: "Reunification Hall", zh: "统一会堂", ja: "統一会堂", ko: "통일회관" },
    text: {
      vi: "Sau ngày 30 tháng 4 năm 1975, Dinh Độc Lập được đổi tên thành Hội trường Thống Nhất, gắn với ý nghĩa đất nước đã liền một dải. Công trình được xếp hạng Di tích quốc gia đặc biệt năm 2009. Ngày nay, mỗi năm nơi đây đón rất nhiều du khách trong nước và quốc tế. Cảm ơn bạn đã lắng nghe.",
      en: "After 30 April 1975, Independence Palace was renamed Reunification Hall, reflecting a country made whole again. The site was designated a Special National Monument in 2009. Today it welcomes many domestic and international visitors every year. Thank you for listening.",
      zh: "1975年4月30日之后，独立宫更名为统一会堂，寓意国家重归统一。2009年，该建筑被列为国家特别遗迹。如今，每年都有大量国内外游客到访。感谢您的收听。",
      ja: "1975年4月30日の後、独立宮殿は統一会堂と改称され、国が再び一つになったことを表しています。2009年には特別国家遺跡に指定されました。現在も毎年多くの国内外の観光客が訪れています。ご清聴ありがとうございました。",
      ko: "1975년 4월 30일 이후 독립궁은 통일회관으로 이름이 바뀌었고, 나라가 다시 하나가 되었음을 뜻합니다. 2009년에는 특별 국가 유적으로 지정되었습니다. 오늘날에도 매년 많은 국내외 관광객이 이곳을 찾습니다. 들어 주셔서 감사합니다."
    }
  }
];


const byId = Object.fromEntries([...palaceCore, ...palaceMore].map((x) => [x.id, x]));
const TOUR_ORDER = [
  "gate", "history", "architecture", "credentials", "reception", "presidentRoom", "cabinet", "office",
  "family", "rooftop", "bunker", "garden", "vehicles", "exhibition", "reunification"
];

const allStops = TOUR_ORDER.map((id, i) => {
  const stop = byId[id];
  return { ...stop, order: i + 1, summary: stop.summary || summaries[id] };
});
export const stops = [...allStops];

// Ghi đè nội dung bằng dữ liệu tải từ Supabase (do dashboard sửa). Có thể gọi nhiều lần.
const REMOTE_FIELDS = { title: "title", floor: "floor", summary: "summary", body: "text" };
export const applyRemoteContent = (stopRows = [], translationRows = []) => {
  for (const r of translationRows) {
    const s = allStops.find((x) => x.id === r.stop_id);
    if (!s || !isSupportedLang(r.lang)) continue;
    for (const [col, field] of Object.entries(REMOTE_FIELDS)) if (r[col]) s[field][r.lang] = r[col];
  }
  const hidden = new Set(stopRows.filter((r) => r.published === false).map((r) => r.id));
  const visible = allStops.filter((s) => !hidden.has(s.id));
  if (!visible.length) return;
  visible.forEach((s, i) => { s.order = i + 1; });
  stops.splice(0, stops.length, ...visible);
};

// ---- Helpers ----
export const isSupportedLang = (code) => LANGUAGES.some((l) => l.code === code);
export const normalizeLang = (code) => (isSupportedLang(code) ? code : DEFAULT_LANG);
export const speechLang = (code) => (LANGUAGES.find((l) => l.code === code) || LANGUAGES[0]).speech;
export const t = (lang, key) => (ui[normalizeLang(lang)] || ui[DEFAULT_LANG])[key] ?? ui[DEFAULT_LANG][key] ?? key;

export const localized = (stop, field, lang) => stop[field][normalizeLang(lang)] || stop[field][DEFAULT_LANG];

// Đoán ngôn ngữ từ locale thiết bị, ví dụ "ja-JP" -> "ja", "zh-TW" -> "zh"
export const detectLang = (locale = "") => {
  const base = String(locale).toLowerCase().split(/[-_]/)[0];
  return isSupportedLang(base) ? base : DEFAULT_LANG;
};

// Ước lượng thời lượng nghe (giây): CJK ~ 5 ký tự/giây, còn lại ~ 2.6 từ/giây ở tốc độ 1x
export const estimateSeconds = (text, lang, rate = 1) => {
  const r = rate > 0 ? rate : 1;
  if (["zh", "ja", "ko"].includes(lang)) return Math.max(1, Math.round(text.replace(/\s/g, "").length / 5 / r));
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 2.6 / r));
};

export const formatMinutes = (seconds) => Math.max(1, Math.round(seconds / 60));

export const stopsByCategory = (category) => stops.filter((s) => s.category === category);

// Điểm trước/sau trong CÙNG nhóm (Trong Dinh / Lân cận); trả về null ở hai đầu
export const getNextStop = (currentId, direction = 1) => {
  const current = stops.find((s) => s.id === currentId);
  if (!current) return stops[0];
  const group = stopsByCategory(current.category);
  const j = group.findIndex((s) => s.id === currentId) + direction;
  return j >= 0 && j < group.length ? group[j] : null;
};

export const searchStops = (query, lang, category) => {
  const q = query.trim().toLowerCase();
  const pool = category ? stopsByCategory(category) : stops;
  if (!q) return pool;
  return pool.filter((s) =>
    `${localized(s, "title", lang)} ${localized(s, "floor", lang)} ${localized(s, "summary", lang)}`.toLowerCase().includes(q));
};

// Chọn giọng đọc tốt nhất cho một ngôn ngữ từ danh sách giọng của thiết bị
export const pickVoice = (voices, lang) => {
  const target = speechLang(lang).toLowerCase();
  const prefix = target.split("-")[0];
  return (
    voices.find((v) => v.lang && v.lang.toLowerCase().replace("_", "-") === target) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(prefix)) ||
    null
  );
};

// ---- Tọa độ sơ đồ mặt bằng Dinh Độc Lập (Chuẩn theo 2 bản đồ chính thức: Khuôn viên & Các tầng trong Dinh) ----
// viewMode: "grounds" (Bản đồ tổng thể khuôn viên) | "floors" (Sơ đồ mặt cắt các tầng trong tòa nhà chính)
export const PALACE_MAP_POSITIONS = {
  // Điểm ngoài khuôn viên & tổng thể (Dựa trên Ảnh 1 - Bản đồ khuôn viên)
  gate:          { viewMode: "grounds", zone: "grounds", x: 50, y: 86, floorX: 50, floorY: 88, badge: "1",  roomCode: "Cổng chính" },
  exhibition:    { viewMode: "grounds", zone: "grounds", x: 13, y: 69, floorX: 18, floorY: 75, badge: "🏛️", roomCode: "Nhà trưng bày" },
  garden:        { viewMode: "grounds", zone: "grounds", x: 76, y: 68, floorX: 78, floorY: 68, badge: "★3", roomCode: "Xe tăng & F-5E" },
  architecture:  { viewMode: "grounds", zone: "grounds", x: 50, y: 46, floorX: 50, floorY: 50, badge: "📐", roomCode: "Mặt tiền Dinh" },
  history:       { viewMode: "grounds", zone: "grounds", x: 50, y: 58, floorX: 50, floorY: 64, badge: "🏛️", roomCode: "Dinh Norodom → Độc Lập" },
  reunification: { viewMode: "grounds", zone: "grounds", x: 50, y: 36, floorX: 50, floorY: 36, badge: "🕊️", roomCode: "Hội trường Thống Nhất" },

  // Điểm trong tòa nhà chính theo từng tầng (Dựa trên Ảnh 2 - Sơ đồ 6 tầng)
  bunker:        { viewMode: "floors",  zone: "bunker",  x: 43, y: 40, floorX: 48, floorY: 54, badge: "19-24", roomCode: "Tầng hầm chỉ huy" },
  vehicles:      { viewMode: "floors",  zone: "ground",  x: 40, y: 46, floorX: 38, floorY: 66, badge: "26,28", roomCode: "Tầng trệt · Xe Jeep & Mercedes" },
  cabinet:       { viewMode: "floors",  zone: "floor1",  x: 58, y: 44, floorX: 67, floorY: 56, badge: "1",     roomCode: "Tầng 1 · Phòng Nội các" },
  reception:     { viewMode: "floors",  zone: "floor1",  x: 42, y: 38, floorX: 36, floorY: 38, badge: "4",     roomCode: "Tầng 1 · Phòng Khánh tiết" },
  office:        { viewMode: "floors",  zone: "floor2",  x: 36, y: 52, floorX: 29, floorY: 72, badge: "6",     roomCode: "Tầng 2 · Phòng làm việc TT" },
  presidentRoom: { viewMode: "floors",  zone: "floor2",  x: 43, y: 50, floorX: 38, floorY: 66, badge: "7",     roomCode: "Tầng 2 · Phòng tiếp khách TT" },
  credentials:   { viewMode: "floors",  zone: "floor2",  x: 42, y: 38, floorX: 37, floorY: 42, badge: "11",    roomCode: "Tầng 2 · Phòng trình Quốc thư" },
  family:        { viewMode: "floors",  zone: "floor3",  x: 46, y: 42, floorX: 45, floorY: 60, badge: "12,15", roomCode: "Tầng 2-3 · Gia đình & Chiếu phim" },
  rooftop:       { viewMode: "floors",  zone: "floor4",  x: 52, y: 35, floorX: 52, floorY: 48, badge: "17,18", roomCode: "Tầng 4 · Tứ phương vô sự lầu & UH-1" }
};
