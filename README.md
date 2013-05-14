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


* Ti.UI.Window add animation
* Titanium.UI.createActivityIndicator()
* streaming tweet

* profileWindow :메인메뉴에 나오는 나의 프로필
* userWindow :다른사람의 프로필이 나오는 윈도우

* network queue :네트웤에 연결되지 않은 상황일때 큐에 넣고 네트웤이 활성화 되면 실행


## note!
* 짧은 에니메이션이 들어가면 훨씬 빠르게 느껴진다.
* 배포전 반드시 twitter.js 컨슈며 토큰, acs토큰, 등을 교체하고 외부로 돌리고 gitignore


## worried
* 하나의 birdhouse.js를 여러 함수에서 동시에 사용하는데 동시성 문제가 없나? userView.js만 해도 user.getUser()와 user.getProfileBanner()를 동시에 호출하는데.
* tiapp.xml의 <name>yotoo!</name>에 오류가 뜨는데..
* strings.xml의 name에도 !가 들어가면 안된다.
* jsOAuth136.js의  xhr.onreadystatechange 함수에서 xhr.status가 0일 경우 성공으로 간주하는데 네트웤 신호가 약할때 parseTokenRequest함수에서 tokenRequest.text.split('&')을 할때 널포인트 exception발생 


## known issue
* tweetRow.js :서치를 위해 타이틀을 투명하게 해서 값을 셋팅해 놓는데, 특수문자는 투명도값이 안먹힌다.


## delayed
* twitter certified products. (https://dev.twitter.com/programs/twitter-certified-products/apply)
* 스트리밍에 연결된 상태를 한번에 보여주기 위한 UI필요 
* Your application must handle the HTTP 420 error code that indicates that the account has been logging in too often. This response will be the indication that the account has exceeded the per-account-per-application connection limit described above. Indicate to the user that they have been automatically and temporarily banned from User Streams for an excessive login rate. The user should be advised to shut down extra copies of the application, perhaps instances running on another device, to restore streaming access.
* data binding으로 tweetTable 구현
* 비번을 바꿧을때(토큰완료됐을때) 액션
* lazy loading을 탭에 적용하자(지금은 프로그램 시작하면 모든 탭을 한꺼번에 로딩함)
* tweetRow에서 프로필 사진 클릭해서 유져뷰 띄울때 파라미터로 userId를 넘기는데 user모델 자체를 넘겨서 이미 가지고 있는 정보를 바로 보여주게 하자!
* tweetRow에서 tableViewRow의 leftImage속성을 사용하자
* Alloy.builtins.moment를 tweetRowView의 ago에 사용(http://momentjs.com/)
* add account하고 또 add account 하면 쿠키때문에 그런지 전에 로긴된 그대로 떠서 자칫 중복 로긴되기 쉽다. :HTTPClient.clearCookies(url);
* 정식으로 twitter서버에 올려진 사진은 인스타그램처럼 일반트윗테이블에 인스타그램처럼 꽉 채워 보여주자
* tweetsView.js 업데이트 바텀 트윗 결과가 없는것으로 판명나면 바텀트윗업데이트를 발생시키는 이벤트리스너를 삭제하고 푸터뷰를 변경한다(유저가 인지할수 있게)
* 아주 간단히 트윗 속도를 알려주자: (트윗수/(오늘-계정생성일)) 
* 로긴 취소 했을때 웹뷰 close
* 트윗 보내고 결과 json 읽기 
* GET help/configuration returns new t.co length :사진 포함 트윗할때 글자수 마이너스(현재 공백 미포함 22 정도 된)  
* 사진 포함 트윗할때 사진주소가 위치 수정 가능하게.
* Ti.Network.HTTPClient.cache 상황에 맞게 true
* twitter streaming api adapter :node.js socket.io.js nTwitter.js등을 이용해야 하나.. , socket.io는 Ti용 모듈을 누가 만들어 놓긴 했네(https://github.com/nowelium/socket.io-titanium)
* account.js 의 changeCurrentAccount()에 cloud 로긴 하는것 네트웤 상황 안좋을때 대응 sessionId만 캐쉬하면 될것 같다.(..디폴트를 캐쉬로 하자)


## done
* 한글 트윗
* twitter REST api
* jsOAuth update http://github.com/bytespider/jsOAuth
* callbackUrl을 셋팅 했을때 access token key, secret 얻기 (twitter2.js의 105 라인 수정)
* jsOAuth 1.3.6 346라인 File이 뭐지?
* Ti.Cloud multi user support :인스턴스의 생성대신 account.js에서 매번 로긴 


## work now
* notification
* listView
* github등록  

  