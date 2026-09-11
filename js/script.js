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
