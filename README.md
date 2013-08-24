# yotoo! - hey dude..
[![from zazima project](http://feltman.cafe24.com/images/z.bmp)](http://zazima.com/)  

Advanced "Hello, Fuck The World!" application using the Alloy MVC framework.
for heavy user, specialized relationship 

* * *
* * *

## Author
 * dahinir [@dahinir](https://twitter.com/dahinir)



## 
* Models :provide the business logic, containing the rules, data and state of the application.
* Views	:provide the GUI components to the user, either presenting data or allowing the user to interact with the model data.
* Controllers :provide the glue between the model and view components in the form of application logic.


* network queue :네트웤에 연결되지 않은 상황일때 큐에 넣고 네트웤이 활성화 되면 실행


## note!
* 짧은 에니메이션이 들어가면 훨씬 빠르게 느껴진다.


## worried
* 하나의 birdhouse.js를 여러 함수에서 동시에 사용하는데 동시성 문제가 없나? userView.js만 해도 user.getUser()와 user.getProfileBanner()를 동시에 호출하는데.
* tiapp.xml의 <name>yotoo!</name>에 오류가 뜨는데..
* strings.xml의 name에도 !가 들어가면 안된다.
* jsOAuth136.js의  xhr.onreadystatechange 함수에서 xhr.status가 0일 경우 성공으로 간주하는데 네트웤 신호가 약할때 parseTokenRequest함수에서 tokenRequest.text.split('&')을 할때 널포인트 exception발생 


## known issue
* tweetRow.js :서치를 위해 타이틀을 투명하게 해서 값을 셋팅해 놓는데, 특수문자는 투명도값이 안먹힌다.


## for next version
* 스트리밍에 연결된 상태를 한번에 보여주기 위한 UI필요 
* tweetRow에서 프로필 사진 클릭해서 유져뷰 띄울때 파라미터로 userId를 넘기는데 user모델 자체를 넘겨서 이미 가지고 있는 정보를 바로 보여주게 하자!
* 정식으로 twitter서버에 올려진 사진은 인스타그램처럼 일반트윗테이블에 인스타그램처럼 꽉 채워 보여주자
* tweetsView.js 업데이트 바텀 트윗 결과가 없는것으로 판명나면 바텀트윗업데이트를 발생시키는 이벤트리스너를 삭제하고 푸터뷰를 변경한다(유저가 인지할수 있게)
* 아주 간단히 트윗 속도를 알려주자: (트윗수/(오늘-계정생성일)) 
* 트윗 보내고 결과 json 읽기 
* GET help/configuration returns new t.co length :사진 포함 트윗할때 글자수 마이너스(현재 공백 미포함 22 정도 된)  
* 사진 포함 트윗할때 사진주소가 위치 수정 가능하게.
* 지도에서 검색은 위치를 검색하게?
* map annotation 비슷한 위치 합치고 확대하면 분리되고 하는 건..
* userView.js 열때 전에 열려 있는 유저와의 relationship 알려주기 (전에 열려 있는 유저는 editable필드로 작성해서 다른 아이디 쓸 수도 있게!)


## delayed
* twitter certified products. (https://dev.twitter.com/programs/twitter-certified-products/apply)
* Your application must handle the HTTP 420 error code that indicates that the account has been logging in too often. This response will be the indication that the account has exceeded the per-account-per-application connection limit described above. Indicate to the user that they have been automatically and temporarily banned from User Streams for an excessive login rate. The user should be advised to shut down extra copies of the application, perhaps instances running on another device, to restore streaming access.
* data binding으로 구현
* 비번을 바꿧을때(토큰완료됐을때) 액션
* lazy loading을 탭에 적용하자(지금은 프로그램 시작하면 모든 탭을 한꺼번에 로딩함)
* Alloy.builtins.moment를 tweetRowView의 ago에 사용(http://momentjs.com/)
* add account하고 또 add account 하면 쿠키때문에 그런지 전에 로긴된 그대로 떠서 자칫 중복 로긴되기 쉽다. :HTTPClient.clearCookies(url);
* 0. Node.ACS server (개발자 배타 끝나면)
* 1. twitter streaming api adapter :node.js socket.io.js nTwitter.js등을 이용해야 하나.. , socket.io는 Ti용 모듈을 누가 만들어 놓긴 했네(https://github.com/nowelium/socket.io-titanium)
* 2. push notification server
* 3. push notification server with twitter site stream
* custom object로 간다. 서버는 여유가 생기면 만들어서 보안 유지한다. custom object 접근권한 
* http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Sync_Adapters_and_Migrations 의 커스텀 씽크!
* "멱등 버튼" 처리. 예를 들어 "sign in"버튼을 두번 누르면 두개의 로긴창이 뜬다.
* ACL aka access controll list
* yotto_nodeServer 이름을 yotoo_node_acs로 
* account.js addAccount 할때 yotoo한 객체 있나 찾아 보고 저장
* parse.com 푸쉬도 같이 쓸까? no
* Ti.Network.HTTPClient.cache 상황에 맞게 true
* image cache :https://github.com/FokkeZB/nl.fokkezb.cachedImageView :http://docs.appcelerator.com/titanium/latest/#!/guide/Image_Best_Practices-section-30082525_ImageBestPractices-Cachingremoteimages
* 네트웤 상태등의 이유로 밀려 있는 할일 저장해 놓고 실행하는 로직 ex) cloudProxy.postYotoo() 에서 checkTargetYotoo()는 실패 했을때 조용히 다시 시도 되어야 한다.
* 의미있는 User객체들을 로컬에 저장해 놓고 쓰자(유투한 아이, 팔로잉(최근 400), 팔로워(최근 400), 내가쓴 맨션, :그냥 유저가 행위에 따라 읽게된 user들만 저장할까.)
	:캐쉬 개념으로 일정 시간 이상되면 업데이트 하고
	:프로필 보기를 했으면 리프레쉬후 로컬 저장
	:프로필 이미지는 업데이트 했을때 url이 바뀌나? 그렇다면 프로필 이미지 로딩 실퍠시에도 리프레쉬
* twitter 토큰 완료 됬을 경우 대비 


## work now
* Ti.App.iOS.registerBackgroundService()
* yotoos 객체는 언제 리프레쉬 하지?
* 서버의 chat는 관리자만 삭제 할 수 있다...어쩔수 없이 재유투시 이어서 읽도록..
* ACL을 이용해 아무나 yotoo 못보게..하는게 소용 없잖아..
* addNewYotoo() 할 때 source_id_str, target_id_str 같은것이 있으면 
	:hided일 경우 알람창으로 유저 확인후 hided를 false (무료)
	:unyotoo일 경우 알람창으로 유저 확인후 unyotoo를 false (유료)
	:past일 경우 알람창으로 유저 확인후 past를 false (유료)
	:completed일 경우 알람창으로 유저 확인 없이 진행 (유료) 
	:completed는 true, burned는 false 일 경우 알람창으로 불가능 알람  
	:서버와 
	:로컬에 
* yotoo sync
	:yotoo객체의 hide, completed등의 필드 변경이 되었을때 서버에 저장 해야 한다.   
* 서버에 저장된 yotoo는 언제 refresh해서 로컬과 싱크를 맞추지? -로컬엔 있지만 서버에 없는 경우는 없음 
	v:트위터에 새 계정 추가 했을 때.
	:changeCurrentUser시 마지막 yotoo채킹을 해서 일정기간 이상이면 체킹? - no
	:pull to refresh 구현 
* yotoo.checkTargetYotoo() 에서 유투 성공 했을때 보내는 노티피케이션 실패시 큐에 넣던지 해서 성공할때까지 다시 시
	:노티피케이션을 활성화 하지 않는 사용자도 생각해서 프로그램 시작시 컴플릿된 유투가 있는지 확인 해야 한다.
* yotoo 완료 사운드! Eazy-E -Niggaz My Height Don't Fight :40s "yotoo"
* twitter공홈에서 yotoo앱 사용 정지 한 이후 다시 로긴 해 보자
* 반드시 성공 해야 하는 함수를 queue 

## work right now!
* account의 idAttribute를 user와 동일하게 acs_id로 바꾸는게 좋을것 같은데..
* yotoo의 idAttribute도 acs_id로.. 
* chat의 idAttribute도?
* 아이콘을 폰트로!  
* yotoo.burn() 하면 노티 날려서 상대방도 burn 되게.
	:번 된 이후 채팅 실험 
	:번 된 이후 yotoo 정책 명확히. 
		:unyotoo 상태로 만들까?
	: 100 conversation 일때
* 현재 unyotooed된 유투도 유투로 동작한다.. 
* wow! ACS PushNotification의 .query()를 사용하면 노티 등록 안한 유저에게도 노티 보낼수 있다.
	:그럼 프로그램 시작 마다 노티를 쿼리해 오면 해결!! 
	:일단 ti.cloud의 PushNotification.query()의 구현을 기다려 보자.
	:https://github.com/appcelerator-modules/ti.cloud/pull/42
	:http://developer.appcelerator.com/question/156338/i-need-query-for-acs-pushnotifications


탭별로 디렉토리를 나누자
Discover/
	localMapView (한글론 주변)
	localListView
	globalSearchView


yotoo 추가 프로필사진(숨겨진 기능 정도로 :플픽사진 크게 봤을때 다음장 볼수 있는 화살표가 나오게)



