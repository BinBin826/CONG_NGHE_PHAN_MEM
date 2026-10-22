// Địa danh bổ sung và phần mô tả ngắn (summary) cho danh sách.
// Nguồn đối chiếu: dinhdoclap.gov.vn (bản tiếng Anh) và các trang giới thiệu du lịch.
// Với địa danh lân cận, khoảng cách là ước lượng đi bộ; hãy kiểm tra lại trước khi phát hành.

const L = (vi, en, zh, ja, ko) => ({ vi, en, zh, ja, ko });

// Mô tả ngắn cho 8 điểm gốc trong index.js
export const summaries = {
  gate: L(
    "Cổng nơi xe tăng Quân giải phóng tiến vào ngày 30/4/1975.",
    "The gate the Liberation Army tanks drove through on 30 April 1975.",
    "1975年4月30日解放军坦克冲入的大门。",
    "1975年4月30日に解放軍の戦車が突入した門。",
    "1975년 4월 30일 해방군 탱크가 진입한 문."
  ),
  history: L(
    "Từ Dinh Norodom (1868) đến Dinh Độc Lập (1966).",
    "From Norodom Palace (1868) to Independence Palace (1966).",
    "从诺罗敦宫（1868年）到独立宫（1966年）。",
    "ノロドム宮殿（1868年）から独立宮殿（1966年）まで。",
    "노로돔 궁(1868)에서 독립궁(1966)까지."
  ),
  credentials: L(
    "Nơi Tổng thống tiếp đại sứ trình quốc thư.",
    "Where the President received ambassadors' credentials.",
    "总统接受大使递交国书的地方。",
    "大統領が大使から信任状を受けた部屋。",
    "대통령이 대사의 신임장을 받던 방."
  ),
  reception: L(
    "Không gian lớn cho lễ nghi và tiệc chiêu đãi.",
    "A grand space for ceremonies and state banquets.",
    "举办典礼和国宴的宏大空间。",
    "式典や晩餐会のための広い空間。",
    "의식과 연회를 위한 웅장한 공간."
  ),
  cabinet: L(
    "Phòng họp của Nội các và Hội đồng Bộ trưởng.",
    "Meeting room of the Cabinet and Council of Ministers.",
    "内阁与部长会议的会议室。",
    "内閣と閣僚会議が開かれた部屋。",
    "내각과 각료회의가 열리던 회의실."
  ),
  rooftop: L(
    "Sân đỗ trực thăng và dấu vết vụ ném bom 8/4/1975.",
    "The helipad and traces of the 8 April 1975 bombing.",
    "直升机停机坪与1975年4月8日轰炸的痕迹。",
    "ヘリポートと1975年4月8日の爆撃の痕跡。",
    "헬기장과 1975년 4월 8일 폭격의 흔적."
  ),
  bunker: L(
    "Hầm kiên cố với phòng tác chiến và thiết bị liên lạc.",
    "Fortified basement with operations room and radio gear.",
    "设有作战室和通信设备的坚固地下层。",
    "作戦室と通信設備のある堅固な地下階。",
    "작전실과 통신 장비를 갖춘 견고한 지하층."
  ),
  reunification: L(
    "Cái tên Hội trường Thống Nhất và di tích quốc gia đặc biệt.",
    "The name Reunification Hall and its Special National Monument status.",
    "统一会堂之名与国家特别遗迹的地位。",
    "統一会堂という名と特別国家遺跡の指定。",
    "통일회관이라는 이름과 특별 국가 유적 지정."
  )
};

export const palaceMore = [
  {
    id: "architecture", icon: "📐", category: "palace",
    floor: L("Mặt tiền & tổng thể", "Facade & overall design", "立面与整体设计", "ファサードと全体設計", "정면과 전체 설계"),
    title: L("Kiến trúc Ngô Viết Thụ", "Architecture by Ngo Viet Thu", "吴越树的建筑设计", "ゴ・ヴィエト・トゥーの建築", "응오비엣투의 건축"),
    summary: L(
      "Công trình cao 26 m, khoảng 100 phòng, phong cách hiện đại pha nét Việt.",
      "26 m tall, about 100 rooms, modern style with Vietnamese touches.",
      "高26米、约100个房间，现代风格融入越南元素。",
      "高さ26m、約100室、ベトナムらしさを加えたモダン建築。",
      "높이 26m, 약 100개 방, 베트남 색을 더한 현대 건축."
    ),
    text: L(
      "Công trình do kiến trúc sư Ngô Viết Thụ, người Việt đầu tiên đoạt giải Grand Prix de Rome, thiết kế. Tòa nhà cao 26 mét, diện tích xây dựng khoảng 4.500 mét vuông, tổng diện tích sử dụng khoảng 20.000 mét vuông. Dinh có hầm, tầng trệt, ba tầng chính, hai tầng lửng, sân thượng và khoảng một trăm phòng. Lớp lam che nắng ở mặt tiền gợi hình khóm tre, thể hiện phong cách hiện đại pha nét truyền thống Việt Nam.",
      "The building was designed by Ngo Viet Thu, the first Vietnamese to win the Grand Prix de Rome. It stands 26 metres tall, with a footprint of about 4,500 square metres and about 20,000 square metres of usable floor space. The palace has a basement, a ground floor, three main floors, two mezzanines, a rooftop and about one hundred rooms. The sun-shading screens on the facade recall clumps of bamboo, blending modern style with Vietnamese tradition.",
      "这座建筑由吴越树设计，他是首位获得罗马大奖的越南人。建筑高26米，占地约4500平方米，使用面积约2万平方米。宫内有地下层、底层、三个主要楼层、两个夹层、屋顶和约一百个房间。立面的遮阳格栅让人联想到竹丛，体现了现代风格与越南传统的融合。",
      "この建物は、ベトナム人として初めてローマ大賞を受賞したゴ・ヴィエト・トゥーの設計です。高さは26メートル、建築面積は約4,500平方メートル、延べ床面積は約2万平方メートルあります。地下、1階、主要3フロア、2つの中2階、屋上、約100の部屋があります。ファサードの日よけは竹林を思わせ、現代的なスタイルとベトナムの伝統を融合しています。",
      "이 건물은 베트남인 최초로 로마 대상을 받은 응오비엣투가 설계했습니다. 높이 26미터, 건축 면적 약 4,500제곱미터, 사용 면적 약 2만 제곱미터입니다. 지하층, 1층, 주요 3개 층, 중이층 2개, 옥상과 약 100개의 방이 있습니다. 정면의 차양은 대나무 숲을 연상시키며 현대적 양식과 베트남 전통을 조화시켰습니다."
    )
  },
  {
    id: "presidentRoom", icon: "🪑", category: "palace",
    floor: L("Khu tiếp tân", "Reception wing", "接待区", "応接エリア", "접견 구역"),
    title: L("Phòng tiếp khách của Tổng thống", "President's Reception Room", "总统会客厅", "大統領の応接室", "대통령 접견실"),
    summary: L(
      "Ghế Tổng thống đặt cao, tựa lưng là bức phù điêu lá cờ.",
      "The President's chair sits higher, with a flag panel behind it.",
      "总统座椅位置更高，身后是国旗造型的木板。",
      "大統領の椅子は一段高く、背後に国旗を表す板があります。",
      "대통령 의자는 더 높고 뒤에 국기를 상징하는 판이 있습니다."
    ),
    text: L(
      "Đây là nơi Tổng thống tiếp khách. Chiếc ghế của Tổng thống được đặt cao hơn, phía sau là tấm gỗ lớn tượng trưng cho lá cờ quốc gia. Hãy để ý các tay ghế: ghế của Tổng thống và khách cấp cao chạm đầu rồng, còn ghế của những người khác chạm đầu phượng và chữ Thọ. Cách bố trí này thể hiện rõ thứ bậc và nghi lễ.",
      "This is where the President received guests. His chair is set higher, with a large wooden panel behind it representing the national flag. Look at the armrests: chairs for the President and senior guests are carved with dragon heads, while the others have phoenix heads and the character for longevity. The arrangement clearly expresses rank and protocol.",
      "这里是总统会客的地方。总统的座椅位置更高，身后是象征国旗的大木板。请留意扶手：总统和高级来宾的座椅雕刻龙头，其他人的座椅则雕刻凤头和寿字。这样的布置清楚地体现了等级与礼仪。",
      "ここは大統領が来客を迎えた部屋です。大統領の椅子は一段高く、背後には国旗を表す大きな木の板があります。肘掛けにご注目ください。大統領と要人の椅子には龍の頭、その他の人の椅子には鳳凰の頭と寿の字が彫られています。この配置が序列と儀礼をはっきり示しています。",
      "이곳은 대통령이 손님을 맞이하던 방입니다. 대통령의 의자는 더 높게 놓였고 뒤에는 국기를 상징하는 큰 목판이 있습니다. 팔걸이를 보세요. 대통령과 고위 인사의 의자에는 용머리가, 그 밖의 사람들 의자에는 봉황 머리와 수(壽) 자가 새겨져 있습니다. 이 배치는 서열과 의전을 분명히 보여 줍니다."
    )
  },
  {
    id: "office", icon: "🖋️", category: "palace",
    floor: L("Khu làm việc", "Office wing", "办公区", "執務エリア", "집무 구역"),
    title: L("Phòng làm việc của Tổng thống", "President's Office", "总统办公室", "大統領執務室", "대통령 집무실"),
    summary: L(
      "Nơi Tổng thống Nguyễn Văn Thiệu làm việc và tiếp khách.",
      "Where President Nguyen Van Thieu worked and met visitors.",
      "阮文绍总统办公和会客的地方。",
      "グエン・ヴァン・ティエウ大統領が執務し来客と会った部屋。",
      "응우옌반티에우 대통령이 업무를 보고 손님을 만나던 곳."
    ),
    text: L(
      "Đây là phòng làm việc của Tổng thống. Tổng thống Nguyễn Văn Thiệu và Thủ tướng Trần Văn Hương từng tiếp khách tại đây, trong đó có cuộc gặp ngày 25 tháng 9 năm 1968. Căn phòng cho thấy nơi điều hành công việc hằng ngày của người đứng đầu chính quyền Sài Gòn.",
      "This is the President's office. President Nguyen Van Thieu and Prime Minister Tran Van Huong received visitors here, including a meeting on 25 September 1968. The room shows where the head of the Saigon government ran daily affairs.",
      "这里是总统办公室。阮文绍总统和陈文香总理曾在此会见来宾，其中包括1968年9月25日的一次会晤。这个房间展示了西贡政府首脑处理日常事务的地方。",
      "ここは大統領執務室です。グエン・ヴァン・ティエウ大統領とチャン・ヴァン・フオン首相がここで来客と会い、その中には1968年9月25日の会談も含まれます。サイゴン政府の首脳が日々の業務を行った場所です。",
      "이곳은 대통령 집무실입니다. 응우옌반티에우 대통령과 쩐반흐엉 총리가 이곳에서 손님을 맞이했으며, 1968년 9월 25일의 회견도 그중 하나입니다. 사이공 정부 수반이 일상 업무를 보던 곳입니다."
    )
  },
  {
    id: "family", icon: "🛋️", category: "palace",
    floor: L("Khu sinh hoạt gia đình", "Family quarters", "家庭起居区", "家族の居住区", "가족 생활 구역"),
    title: L("Khu sinh hoạt & phòng chiếu phim", "Family quarters & cinema", "起居区与放映室", "居住区とシネマルーム", "생활 구역과 영화실"),
    summary: L(
      "Không gian riêng của gia đình Tổng thống, có phòng chiếu phim.",
      "The presidential family's private space, with a cinema room.",
      "总统家属的私人空间，设有放映室。",
      "大統領家族のプライベート空間。シネマルームがあります。",
      "대통령 가족의 사적 공간으로 영화실이 있습니다."
    ),
    text: L(
      "Dinh được thiết kế vừa là nơi làm việc vừa là nơi ở của Tổng thống, nên có khu sinh hoạt riêng cho gia đình. Theo giới thiệu tham quan, khu này giữ nhiều đồ nội thất nguyên bản và có một phòng chiếu phim riêng. Không khí ở đây yên tĩnh và gần gũi hơn so với các phòng nghi lễ ở phía dưới.",
      "The palace was designed as both the President's workplace and residence, so it has private quarters for his family. According to visitor guides, this area keeps much original furniture and includes a private cinema room. The atmosphere is quieter and more intimate than the ceremonial rooms below.",
      "宫殿既是总统的办公场所，也是他的住所，因此设有家属的私人起居区。据参观介绍，这里保留了许多原始家具，并设有一间私人放映室。这里的氛围比楼下的礼仪厅更安静、更亲切。",
      "宮殿は大統領の職場であり住まいでもあるよう設計されたため、家族のための居住区があります。見学案内によると、このエリアには当時の家具が多く残り、専用のシネマルームもあります。下の儀礼用の部屋よりも静かで親密な雰囲気です。",
      "이 궁은 대통령의 집무 공간이자 거처로 설계되어 가족을 위한 생활 구역이 있습니다. 관람 안내에 따르면 이곳에는 당시의 가구가 많이 남아 있고 전용 영화실도 있습니다. 아래층의 의전용 방보다 조용하고 아늑한 분위기입니다."
    )
  },
  {
    id: "garden", icon: "🌳", category: "palace",
    floor: L("Vườn phía sau Dinh", "Gardens behind the palace", "宫殿后花园", "宮殿の裏庭", "궁 뒤편 정원"),
    title: L("Khu vườn & máy bay F-5E", "Gardens & F-5E fighter", "花园与F-5E战机", "庭園とF-5E戦闘機", "정원과 F-5E 전투기"),
    summary: L(
      "Khu vườn nhiều bóng cây, có trưng bày máy bay F-5E.",
      "Shaded gardens with an F-5E fighter on display.",
      "绿荫成片的花园，陈列着一架F-5E战机。",
      "木陰の庭園に、F-5E戦闘機が展示されています。",
      "나무 그늘이 많은 정원에 F-5E 전투기가 전시되어 있습니다."
    ),
    text: L(
      "Phía sau Dinh là khu vườn nhiều bóng cây, thích hợp để đi dạo chậm. Tại đây có trưng bày một chiếc máy bay chiến đấu F-5E, cùng loại máy bay mà phi công Nguyễn Thành Trung đã lái khi ném bom xuống Dinh ngày 8 tháng 4 năm 1975. Khoảng xanh này tạo sự tương phản với những câu chuyện lịch sử nặng nề của công trình.",
      "Behind the palace lie shaded gardens, ideal for a slow walk. An F-5E fighter jet is on display here, the same type of aircraft that pilot Nguyen Thanh Trung flew when he bombed the palace on 8 April 1975. The greenery contrasts with the weighty history of the building.",
      "宫殿后面是绿荫成片的花园，适合慢慢散步。这里陈列着一架F-5E战机，与飞行员阮成忠1975年4月8日轰炸宫殿时驾驶的是同一机型。这片绿色与建筑沉重的历史形成了对比。",
      "宮殿の裏手には木陰の庭園が広がり、ゆっくり散策するのに向いています。ここにはF-5E戦闘機が展示されており、1975年4月8日にグエン・タイン・チュン操縦士が宮殿を爆撃した際と同じ機種です。緑の空間は、建物の重い歴史と対照的です。",
      "궁 뒤편에는 나무 그늘이 많은 정원이 있어 천천히 산책하기 좋습니다. 이곳에는 F-5E 전투기가 전시되어 있는데, 1975년 4월 8일 응우옌탄쭝 조종사가 궁을 폭격할 때 몰았던 것과 같은 기종입니다. 푸른 공간은 건물의 무거운 역사와 대비를 이룹니다."
    )
  },
  {
    id: "vehicles", icon: "🚙", category: "palace",
    floor: L("Khu trưng bày xe", "Vehicle display", "车辆展区", "車両展示", "차량 전시"),
    title: L("Xe Jeep & xe Mercedes", "Jeep & Mercedes", "吉普车与奔驰", "ジープとメルセデス", "지프와 메르세데스"),
    summary: L(
      "Chiếc Jeep chở ông Dương Văn Minh đến Đài phát thanh ngày 30/4/1975.",
      "The Jeep that took Duong Van Minh to the radio station on 30 April 1975.",
      "1975年4月30日载杨文明前往广播电台的吉普车。",
      "1975年4月30日にズオン・ヴァン・ミンをラジオ局へ運んだジープ。",
      "1975년 4월 30일 즈엉반민을 방송국으로 태운 지프."
    ),
    text: L(
      "Tại đây trưng bày hai phương tiện gắn với lịch sử Dinh. Chiếc Jeep M151A2 đã chở Tổng thống Dương Văn Minh đến Đài phát thanh Sài Gòn ngày 30 tháng 4 năm 1975. Bên cạnh là chiếc Mercedes Benz mà Tổng thống Nguyễn Văn Thiệu từng sử dụng.",
      "Two vehicles tied to the palace's history are displayed here. The M151A2 Jeep carried President Duong Van Minh to Saigon Radio on 30 April 1975. Beside it is the Mercedes Benz once used by President Nguyen Van Thieu.",
      "这里陈列着两辆与宫殿历史相关的车。M151A2吉普车曾于1975年4月30日载着杨文明总统前往西贡广播电台。旁边是阮文绍总统曾使用的奔驰轿车。",
      "ここには宮殿の歴史に関わる2台の車が展示されています。M151A2ジープは、1975年4月30日にズオン・ヴァン・ミン大統領をサイゴン放送局へ運びました。隣には、グエン・ヴァン・ティエウ大統領が使用したメルセデス・ベンツがあります。",
      "이곳에는 궁의 역사와 관련된 차량 두 대가 전시되어 있습니다. M151A2 지프는 1975년 4월 30일 즈엉반민 대통령을 사이공 방송국으로 태웠습니다. 그 옆에는 응우옌반티에우 대통령이 사용했던 메르세데스 벤츠가 있습니다."
    )
  },
  {
    id: "exhibition", icon: "🏺", category: "palace",
    floor: L("Nhà trưng bày", "Exhibition house", "展览馆", "展示館", "전시관"),
    title: L("Nhà trưng bày", "Exhibition House", "展览馆", "展示館", "전시관"),
    summary: L(
      "Trưng bày \"Từ Dinh Norodom đến Dinh Độc Lập 1868–1966\".",
      "The permanent exhibition \"From Norodom Palace to Independence Palace, 1868–1966\".",
      "常设展览“从诺罗敦宫到独立宫（1868—1966）”。",
      "常設展「ノロドム宮殿から独立宮殿へ 1868〜1966」。",
      "상설전 '노로돔 궁에서 독립궁까지, 1868–1966'."
    ),
    text: L(
      "Nhà trưng bày là tòa nhà riêng trong khuôn viên, giới thiệu chuyên đề từ Dinh Norodom đến Dinh Độc Lập, giai đoạn 1868 đến 1966, với hàng nghìn hiện vật. Bạn nên dành khoảng ba mươi đến bốn mươi lăm phút để xem. Đây là nơi hiểu rõ nhất quá trình hình thành và thay đổi của công trình.",
      "The Exhibition House is a separate building in the grounds presenting the story from Norodom Palace to Independence Palace, 1868 to 1966, with thousands of objects. Allow around thirty to forty-five minutes. It is the best place to understand how the building took shape and changed.",
      "展览馆是院内的独立建筑，以1868年至1966年从诺罗敦宫到独立宫为主题，展出数千件文物。建议预留三十到四十五分钟参观。这里最能帮助您了解建筑的形成和演变。",
      "展示館は敷地内の独立した建物で、1868年から1966年までのノロドム宮殿から独立宮殿への歩みを、数千点の展示品で紹介しています。見学には30〜45分ほどかかります。建物の成り立ちと変遷を理解するのに最適な場所です。",
      "전시관은 경내의 별도 건물로, 1868년부터 1966년까지 노로돔 궁에서 독립궁에 이르는 과정을 수천 점의 유물로 소개합니다. 관람에는 30~45분 정도가 걸립니다. 건물이 만들어지고 변해 온 과정을 이해하기에 가장 좋은 곳입니다."
    )
  }
];

export const nearby = [
  {
    id: "notredame", icon: "⛪", category: "nearby",
    floor: L("Khoảng 10 phút đi bộ", "About a 10-minute walk", "步行约10分钟", "徒歩約10分", "도보 약 10분"),
    title: L("Nhà thờ Đức Bà Sài Gòn", "Saigon Notre-Dame Basilica", "西贡圣母大教堂", "サイゴン大教会", "사이공 노트르담 대성당"),
    summary: L(
      "Nhà thờ gạch đỏ xây từ 1863 đến 1880 với hai tháp chuông.",
      "Red-brick cathedral built 1863–1880, with two bell towers.",
      "1863至1880年建成的红砖教堂，有两座钟楼。",
      "1863〜1880年に建てられた赤レンガの教会。鐘楼が2つあります。",
      "1863~1880년에 지은 붉은 벽돌 성당, 종탑이 두 개 있습니다."
    ),
    text: L(
      "Vương cung thánh đường Chính tòa Đức Bà Sài Gòn được xây dựng từ năm 1863 đến năm 1880 thời Pháp thuộc. Công trình nổi bật với màu gạch đỏ và hai tháp chuông cao khoảng sáu mươi mét. Đây là biểu tượng kiến trúc của trung tâm thành phố và nằm cách Dinh Độc Lập khoảng mười phút đi bộ.",
      "The Saigon Notre-Dame Basilica was built between 1863 and 1880 during the French colonial period. It stands out for its red bricks and two bell towers about sixty metres tall. It is an architectural symbol of the city centre, roughly a ten-minute walk from Independence Palace.",
      "西贡圣母大教堂建于法属时期的1863年至1880年。它以红砖外墙和两座约六十米高的钟楼而闻名，是市中心的建筑标志，距离独立宫步行约十分钟。",
      "サイゴン大教会は、フランス植民地時代の1863年から1880年にかけて建てられました。赤レンガと、高さ約60メートルの2つの鐘楼が特徴です。市の中心を象徴する建築で、独立宮殿から徒歩約10分です。",
      "사이공 노트르담 대성당은 프랑스 식민 시기인 1863년부터 1880년 사이에 지어졌습니다. 붉은 벽돌과 높이 약 60미터의 두 종탑이 특징입니다. 도심의 건축적 상징이며 독립궁에서 도보로 약 10분 거리입니다."
    )
  },
  {
    id: "post", icon: "📮", category: "nearby",
    floor: L("Cạnh Nhà thờ Đức Bà", "Next to the Basilica", "紧邻圣母大教堂", "大教会のすぐ隣", "대성당 바로 옆"),
    title: L("Bưu điện Trung tâm Sài Gòn", "Saigon Central Post Office", "西贡中央邮局", "サイゴン中央郵便局", "사이공 중앙우체국"),
    summary: L(
      "Tòa nhà thời Pháp xây 1886–1891, vẫn hoạt động đến nay.",
      "French-era building from 1886–1891, still a working post office.",
      "1886至1891年的法式建筑，至今仍在营业。",
      "1886〜1891年のフランス統治時代の建物で、今も営業中。",
      "1886~1891년의 프랑스풍 건물로 지금도 운영됩니다."
    ),
    text: L(
      "Bưu điện Trung tâm Sài Gòn được xây từ khoảng năm 1886 đến 1891 và do kiến trúc sư Alfred Foulhoux thiết kế. Sảnh lớn có mái vòm cao, bản đồ cổ trên tường, và nơi đây vẫn là một bưu điện đang hoạt động. Bạn có thể gửi một tấm bưu thiếp làm kỷ niệm.",
      "The Saigon Central Post Office was built from about 1886 to 1891 and designed by architect Alfred Foulhoux. Its great hall has a high vaulted roof and old maps on the walls, and it is still a working post office. You can send a postcard as a souvenir.",
      "西贡中央邮局建于1886年至1891年前后，由建筑师阿尔弗雷德·富尔乌设计。大厅拱顶高耸，墙上挂着古地图，至今仍是一家正在营业的邮局。您可以寄一张明信片留作纪念。",
      "サイゴン中央郵便局は1886年から1891年ごろに建てられ、建築家アルフレッド・フールウーが設計しました。大ホールには高いアーチ型の天井と壁の古地図があり、今も現役の郵便局です。記念にはがきを送ってみてはいかがでしょう。",
      "사이공 중앙우체국은 1886년부터 1891년 무렵에 지어졌고 건축가 알프레드 풀루가 설계했습니다. 큰 홀에는 높은 아치형 천장과 벽의 옛 지도가 있으며, 지금도 운영 중인 우체국입니다. 기념으로 엽서를 보내 보세요."
    )
  },
  {
    id: "gialong", icon: "🏯", category: "nearby",
    floor: L("Khoảng 10 phút đi bộ", "About a 10-minute walk", "步行约10分钟", "徒歩約10分", "도보 약 10분"),
    title: L("Bảo tàng TP. Hồ Chí Minh", "Ho Chi Minh City Museum", "胡志明市博物馆", "ホーチミン市博物館", "호찌민시 박물관"),
    summary: L(
      "Từng là Dinh Gia Long, kiến trúc tân cổ điển cuối thế kỷ 19.",
      "Formerly Gia Long Palace, a late-19th-century neoclassical building.",
      "前身为嘉隆宫，19世纪末的新古典主义建筑。",
      "旧ザーロン宮殿。19世紀末の新古典主義建築。",
      "옛 자롱 궁, 19세기 말의 신고전주의 건축."
    ),
    text: L(
      "Bảo tàng Thành phố Hồ Chí Minh đặt trong tòa nhà từng là Dinh Gia Long, xây khoảng những năm 1885 đến 1890 theo phong cách tân cổ điển. Bảo tàng trưng bày lịch sử, văn hóa và đời sống của Sài Gòn và thành phố qua nhiều thời kỳ. Tòa nhà nằm cách Dinh Độc Lập khoảng mười phút đi bộ.",
      "The Ho Chi Minh City Museum is housed in the former Gia Long Palace, built around 1885 to 1890 in a neoclassical style. It displays the history, culture and daily life of Saigon and the city across many eras. The building is roughly a ten-minute walk from Independence Palace.",
      "胡志明市博物馆设在曾经的嘉隆宫内，建于1885年至1890年前后，属新古典主义风格。馆内展示西贡及这座城市在不同时期的历史、文化与生活。该建筑距离独立宫步行约十分钟。",
      "ホーチミン市博物館は、1885年から1890年ごろに新古典主義様式で建てられた旧ザーロン宮殿にあります。サイゴンと市の歴史、文化、暮らしを時代ごとに紹介しています。独立宮殿から徒歩約10分です。",
      "호찌민시 박물관은 1885년부터 1890년 무렵 신고전주의 양식으로 지어진 옛 자롱 궁에 자리합니다. 사이공과 도시의 역사, 문화, 생활을 여러 시대에 걸쳐 전시합니다. 독립궁에서 도보로 약 10분 거리입니다."
    )
  },
  {
    id: "warmuseum", icon: "🕯️", category: "nearby",
    floor: L("Khoảng 10–15 phút đi bộ", "About a 10–15 minute walk", "步行约10至15分钟", "徒歩約10〜15分", "도보 약 10~15분"),
    title: L("Bảo tàng Chứng tích Chiến tranh", "War Remnants Museum", "战争遗迹博物馆", "戦争証跡博物館", "전쟁 증적 박물관"),
    summary: L(
      "Bảo tàng về chiến tranh Việt Nam, mở cửa từ năm 1975.",
      "A museum on the Vietnam War, open since 1975.",
      "关于越南战争的博物馆，1975年起开放。",
      "ベトナム戦争の博物館。1975年に開館。",
      "베트남 전쟁을 다루는 박물관, 1975년 개관."
    ),
    text: L(
      "Bảo tàng Chứng tích Chiến tranh mở cửa từ năm 1975 và giới thiệu về chiến tranh Việt Nam qua hình ảnh, tư liệu và hiện vật. Nội dung có thể gây xúc động mạnh, nên cần sự cân nhắc khi đi cùng trẻ nhỏ. Bảo tàng nằm cách Dinh Độc Lập khoảng mười đến mười lăm phút đi bộ.",
      "The War Remnants Museum has been open since 1975 and presents the Vietnam War through photographs, documents and objects. Some content can be deeply upsetting, so consider this when visiting with young children. It is roughly a ten to fifteen minute walk from Independence Palace.",
      "战争遗迹博物馆自1975年起开放，通过照片、资料和实物介绍越南战争。部分内容可能令人感到强烈不适，带小孩参观时请酌情考虑。博物馆距离独立宫步行约十到十五分钟。",
      "戦争証跡博物館は1975年に開館し、写真、資料、実物でベトナム戦争を紹介しています。強い衝撃を受ける展示もあるため、小さなお子様連れの場合はご配慮ください。独立宮殿から徒歩約10〜15分です。",
      "전쟁 증적 박물관은 1975년에 개관하여 사진, 자료, 유물로 베트남 전쟁을 소개합니다. 충격이 큰 전시도 있으므로 어린이와 함께 방문할 때는 유의하세요. 독립궁에서 도보로 약 10~15분 거리입니다."
    )
  },
  {
    id: "benthanh", icon: "🛍️", category: "nearby",
    floor: L("Khoảng 20 phút đi bộ", "About a 20-minute walk", "步行约20分钟", "徒歩約20分", "도보 약 20분"),
    title: L("Chợ Bến Thành", "Ben Thanh Market", "滨城市场", "ベンタイン市場", "벤탄 시장"),
    summary: L(
      "Chợ biểu tượng của thành phố, tòa nhà hiện nay khánh thành 1914.",
      "The city's iconic market; the current building opened in 1914.",
      "城市标志性市场，现有建筑于1914年落成。",
      "市を象徴する市場。現在の建物は1914年に開業。",
      "도시의 상징적인 시장, 현재 건물은 1914년 개장."
    ),
    text: L(
      "Chợ Bến Thành là một trong những biểu tượng của Thành phố Hồ Chí Minh. Tòa nhà hiện nay được khánh thành năm 1914, nổi bật với tháp đồng hồ ở cổng chính. Chợ bán đồ lưu niệm, vải vóc, đặc sản và có nhiều quầy ăn uống. Từ Dinh Độc Lập bạn có thể đi bộ khoảng hai mươi phút hoặc đi taxi.",
      "Ben Thanh Market is one of the symbols of Ho Chi Minh City. The current building opened in 1914 and is known for the clock tower over its main gate. It sells souvenirs, fabrics and local specialties, and has many food stalls. From Independence Palace you can walk about twenty minutes or take a taxi.",
      "滨城市场是胡志明市的象征之一。现有建筑于1914年落成，正门上方的钟楼十分醒目。市场出售纪念品、布料和各地特产，还有许多小吃摊。从独立宫步行约二十分钟，也可以乘出租车前往。",
      "ベンタイン市場はホーチミン市を象徴する場所のひとつです。現在の建物は1914年に開業し、正門の時計塔が目印です。お土産、布地、名物を売る店や多くの屋台があります。独立宮殿から徒歩約20分、タクシーでも行けます。",
      "벤탄 시장은 호찌민시의 상징 중 하나입니다. 현재 건물은 1914년에 개장했으며 정문 위의 시계탑이 눈에 띕니다. 기념품, 직물, 특산품을 팔고 음식 노점도 많습니다. 독립궁에서 도보로 약 20분이며 택시로도 갈 수 있습니다."
    )
  }
];
