// 현재 연도를 자동으로 표시합니다.
document.getElementById('year').textContent = new Date().getFullYear();

// 페이지 내 이동 시 헤더에 가려지는 것을 줄이기 위해 섹션 위치를 보정합니다.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

// GitHub 공개 API에서 프로필 정보와 활동 통계를 가져옵니다.
const GITHUB_USERNAME = 'zuzusnasna';
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_EVENTS_API = `${GITHUB_API}/events/public?per_page=30`;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(dateString));
};

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

async function loadGithubActivity() {
  const status = document.getElementById('activity-status');

  try {
    const [profileResponse, eventsResponse] = await Promise.all([
      fetch(GITHUB_API),
      fetch(GITHUB_EVENTS_API)
    ]);

    if (!profileResponse.ok || !eventsResponse.ok) {
      throw new Error('GitHub API request failed');
    }

    const profile = await profileResponse.json();
    const events = await eventsResponse.json();

    setText('repo-count', profile.public_repos);
    setText('follower-count', profile.followers);
    setText('following-count', profile.following);

    const pushEvents = events.filter((event) => event.type === 'PushEvent');
    const activeRepositories = new Set(events.map((event) => event.repo?.name).filter(Boolean));
    const latestEvent = events[0];

    setText('push-count', pushEvents.length);
    setText('active-repo-count', activeRepositories.size);
    setText('latest-date', latestEvent ? formatDate(latestEvent.created_at) : '-');
    setText('activity-status', '실시간 공개 활동');
  } catch (error) {
    console.error('GitHub activity load failed:', error);
    setText('activity-status', 'GitHub 활동을 불러오지 못했습니다.');
  }
}

loadGithubActivity();

// SwingFit 프로젝트의 연구 논문을 포트폴리오에서 바로 확인할 수 있도록 링크를 추가합니다.
const swingfitCard = [...document.querySelectorAll('.project-card')]
  .find((card) => card.querySelector('h3')?.textContent.trim() === 'SwingFit');

if (swingfitCard) {
  const paperLink = document.createElement('a');
  paperLink.className = 'project-link';
  paperLink.href = 'https://github.com/zuzusnasna/SwingFit/blob/main/DCS_2025_%ED%95%98%EA%B3%84%EC%A2%85%ED%95%A9%ED%95%99%EB%8C%80%ED%9A%8C_%EB%8C%80%ED%95%99%EC%83%9D%EB%85%BC%EB%AC%B8%EA%B2%BD%EC%A7%84%EB%8C%80%ED%9A%8C_%EB%85%BC%EB%AC%B8_%EC%86%A1%EC%A3%BC%EB%B0%95%ED%8C%80.pdf';
  paperLink.target = '_blank';
  paperLink.rel = 'noopener';
  paperLink.textContent = 'Research Paper ↗';
  swingfitCard.querySelector('.project-content').appendChild(paperLink);
}
