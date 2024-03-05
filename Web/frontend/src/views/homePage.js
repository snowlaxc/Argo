import { useContext, useEffect } from "react"; // 리액트에서 useContext 모듈을 가져옵니다.
import UserInfo from "../components/UserInfo"; // UserInfo 컴포넌트를 가져옵니다.
import AuthContext from "../context/AuthContext"; // 커스텀 인증 컨텍스트를 가져옵니다.
import "./homePage.css"
import { Link } from "react-router-dom";
console.log("homepage"); // "homepage"을 콘솔에 출력합니다.

const Home = () => {
  useEffect(() => {
    const smoothScrollTo = (targetY, duration) => {
      const startY = window.scrollY;
      const change = targetY - startY;
      let currentTime = 0;

      const animateScroll = () => {
        currentTime += 20; // 스크롤 애니메이션 간격
        const val = Math.easeInOutQuad(currentTime, startY, change, duration);
        window.scrollTo(0, val);
        if (currentTime < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      Math.easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };

      animateScroll();
    };

    const handleScroll = (event) => {
      event.preventDefault();
      const targetId = event.currentTarget.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        smoothScrollTo(targetElement.offsetTop, 1000); // 1000ms 동안 스크롤
      }
    };

    const scrollElements = document.querySelectorAll('.scrolly');
    scrollElements.forEach(el => {
      el.addEventListener('click', handleScroll);
    });

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      scrollElements.forEach(el => {
        el.removeEventListener('click', handleScroll);
      });
    };
  }, []);

  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        "../../home/assets/js/jquery.min.js",
        // "../../home/assets/js/jquery.scrolly.min.js",
        // "../../home/assets/js/jquery.scrollex.min.js",
        "../../home/assets/js/browser.min.js",
        "../../home/assets/js/breakpoints.min.js",
        "../../home/assets/js/util.js",
        "../../home/assets/js/main.js",
      ];

      for (const src of scripts) {
        try {
          await loadScript(src);
          console.log(`Loaded script: ${src}`);
        } catch (error) {
          console.error(`Error loading script: ${src}`);
        }
      }
    };

    loadScripts();
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  };

  return (
    <div>
      <link rel="stylesheet" href="../../home/assets/css/main.css" />
      <noscript>&lt;link rel="stylesheet" href="../../home/assets/css/noscript.css" /&gt;</noscript>
      {/* Wrapper */}
      <div id="wrapper">
        {/* Banner */}
        <section id="banner" className="major">
          <div className="inner">
            <header className="major">
              <h1>여러분의 성공을 위한 파트너</h1>
            </header>
            <div className="content">
              <p>역량 강화로 전문성을 쌓으세요 <br />
              모르는 것은 챗봇에게 물어보세요</p>
              <ul className="actions">
                <li><a href="#one" className="button next scrolly">Get Started</a></li>
              </ul>
            </div>
          </div>
        </section>
        {/* Main */}
        <div id="main">
          {/* One */}
          <section id="one" className="tiles">
            <article>
              <span className="image">
                <img src="../../home/images/feedback.jpg" alt="feedback" />
              </span>
              <header className="major">
                <h3><Link to="/result" className="link">피드백</Link></h3>
                <p>개인별 맞춤 피드백으로 성장하기</p>
              </header>
            </article>
            <article>
              <span className="image">
                <img src="../../home/images/development.jpg" alt="development" />
              </span>
              <header className="major">
                <h3><Link to="/learn" className="link">역량개발</Link></h3>
                <p>커뮤니케이션과 기초 업무 능력을 강화하기</p>
              </header>
            </article>
            <article>
              <span className="image">
                <img src="../../home/images/chatbot.jpg" alt="chatbot" />
              </span>
              <header className="major">
                <h3><Link to="/chat" className="link">사내규정 도우미</Link></h3>
                <p>사내규정에 대해 알아보기</p>
              </header>
            </article>
            <article>
              <span className="image">
                <img src="../../home/images/notice.jpg" alt="notice" />
              </span>
              <header className="major">
                <h3><Link to="/DashBoard" className="link">게시판</Link></h3>
                <p>공지사항과 소식 확인하기</p>
              </header>
            </article>
          </section>
          {/* Two */}
          <section id="two">
            <div className="inner">
              <header className="major">
                <h2>About Us</h2>
              </header>
              <p>저희 ARGO는 신입사원들이 회사에 빠르게 적응하기 위한 필요한 역량을 개발할 수 있도록 지원합니다.<br></br> 
                또한 사내규정 챗봇을 통해 언제든지 회사 정보를 얻을 수 있는 접근성을 제공합니다.<br></br> 
                ARGO에서는 개인의 역량 강화뿐만 아니라, 팀워크와 협업을 중시하는 문화를 조성하고 있습니다. <br></br> 
                이를 통해 신입사원들은 자신의 경력을 발전시키는 동시에 회사의 성공에 기여할 수 있는 가치를 창출합니다.</p>
              <br></br>
              {/* Create a 3x7 table */}
              <table>
                <thead>
                <tr className="name">
                  <th>강OO</th>
                  <th>구OO</th>
                  <th>배OO</th>
                  <th>심OO</th>
                  <th>이OO</th>
                  <th>천OO</th>
                  <th>홍OO</th>
                </tr>
                </thead>
                <tbody>
                  <tr className="pic">
                  <td><img src="img/about_us/jy.jpg" alt="강OO" /></td>
                  <td><img src="img/about_us/bw.jpg" alt="구OO" /></td>
                  <td><img src="img/about_us/jh.jpg" alt="배OO" /></td>
                  <td><img src="img/about_us/wb.jpg" alt="심OO" /></td>
                  <td><img src="img/about_us/wg.jpg" alt="이OO" /></td>
                  <td><img src="img/about_us/gh.jpg" alt="천OO" /></td>
                  <td><img src="img/about_us/sy.jpg" alt="홍OO" /></td>
                  </tr>
                  <tr className="role">
                    <td>AI, BE</td>
                    <td>DB, BE</td>
                    <td>AI, FE</td>
                    <td>PM, 총괄</td>
                    <td>AI, BE</td>
                    <td>INFRA, AI</td>
                    <td>BE, AI</td>
                  </tr>
                  <tr className="github">
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                    <td>github.com/OO</td>
                  </tr>
                </tbody>
              </table>
              <br></br>
              <ul className="actions">
                <li><a href = '#one' className="button next scrolly">Get Started</a></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Home;
