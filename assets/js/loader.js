window.addEventListener('load', function() {
  let pbar = document.getElementById('bar');
  let pct = 0;
  function animateBar() {
    pct += Math.random()*13+12;
    if (pct > 100) pct = 100;
    pbar.style.width = pct + '%';
    if (pct < 100) setTimeout(animateBar, 85);
    else {
      setTimeout(function() {
        document.getElementById('preloader').style.opacity = '0';
        setTimeout(function() {
          document.getElementById('preloader').style.display = 'none';
        }, 620);
      }, 250);
    }
  }
  animateBar();
});
