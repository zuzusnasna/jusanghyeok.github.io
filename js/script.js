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

// GitHub 공개 API에서 프로필 정보와 최근 활동을 가져옵니다.
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
  const activityList = document.getElementById('activity-list');
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

    const recentEvents = events.filter((event) =>
      ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'WatchEvent'].includes(event.type)
    ).slice(0, 6);

    if (!recentEvents.length) {
      activityList.innerHTML = '<p class="activity-error">최근 공개 활동이 없습니다.</p>';
      return;
    }

    activityList.innerHTML = recentEvents.map((event) => {
      const repoName = event.repo?.name || 'GitHub';
      const action = getActivityText(event);
      return `
        <a class="activity-item" href="https://github.com/${repoName}" target="_blank" rel="noopener">
          <div class="activity-item-main">
            <strong>${escapeHtml(action)}</strong>
            <span>${escapeHtml(repoName)}</span>
          </div>
          <span class="activity-item-time">${formatDate(event.created_at)}</span>
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error('GitHub activity load failed:', error);
    setText('activity-status', 'GitHub 활동을 불러오지 못했습니다.');
    activityList.innerHTML = '<p class="activity-error">GitHub API 호출에 실패했습니다. 프로필 링크에서 최신 활동을 확인할 수 있습니다.</p>';
  }
}

function getActivityText(event) {
  const repo = event.repo?.name || 'repository';
  switch (event.type) {
    case 'PushEvent':
      return `${event.payload?.commits?.length || 0}개 커밋을 ${repo}에 push`;
    case 'CreateEvent':
      return `${repo}에서 ${event.payload?.ref_type || 'repository'} 생성`;
    case 'PullRequestEvent':
      return `Pull Request ${event.payload?.action || '활동'}`;
    case 'IssuesEvent':
      return `Issue ${event.payload?.action || '활동'}`;
    case 'WatchEvent':
      return `${repo} 저장소를 star`;
    default:
      return `${repo}에서 GitHub 활동`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadGithubActivity();
