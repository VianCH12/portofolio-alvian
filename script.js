const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Buka menu navigasi" : "Tutup menu navigasi",
    );
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Buka menu navigasi");
      siteNav.classList.remove("is-open");
    }
  });
}

const videoPreview = document.querySelector(".video-preview");
const videoChoices = document.querySelectorAll(".video-card .media-choice");
const songChoices = document.querySelectorAll(".music-card .media-choice");
const recordCover = document.querySelector(".record-center");
let spotifyPlayer = document.querySelector(".spotify-player");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const preloadedSpotifyPlayers = new Map();

const spotifyEmbedUrl = (songId, itemType = "track") =>
  `https://open.spotify.com/embed/${itemType}/${songId}?utm_source=generator&theme=0`;

const preloadSpotifyTrack = (choice) => {
  if (choice.getAttribute("aria-pressed") === "true") return;

  const { songId, itemType = "track", title } = choice.dataset;
  const playerKey = `${itemType}:${songId}`;
  if (!songId || !title || preloadedSpotifyPlayers.has(playerKey)) return;

  const player = document.createElement("iframe");
  player.className = "spotify-player-preload";
  player.title = `Pemutar ${title} di Spotify`;
  player.src = spotifyEmbedUrl(songId, itemType);
  player.allow =
    "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  player.loading = "eager";
  player.tabIndex = -1;
  player.setAttribute("aria-hidden", "true");
  document.body.append(player);
  preloadedSpotifyPlayers.set(playerKey, player);
};

const animateMediaChange = (elements) => {
  if (reduceMotion.matches) return;

  elements.forEach((element) => {
    if (!element) return;

    element.animate(
      [
        { opacity: 0.45, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 240, easing: "ease-out" },
    );
  });
};

songChoices.forEach((choice) => {
  choice.addEventListener("pointerenter", () => preloadSpotifyTrack(choice));
  choice.addEventListener("focus", () => preloadSpotifyTrack(choice));

  choice.addEventListener("click", () => {
    if (!spotifyPlayer) return;
    if (choice.getAttribute("aria-pressed") === "true") return;

    songChoices.forEach((songChoice) => {
      const isSelected = songChoice === choice;
      songChoice.classList.toggle("is-active", isSelected);
      songChoice.setAttribute("aria-pressed", String(isSelected));
    });

    const {
      songId,
      itemType = "track",
      title,
      description,
      cover,
      spotifyUrl,
    } = choice.dataset;
    if (!songId || !title || !description || !cover || !spotifyUrl) return;

    const playerKey = `${itemType}:${songId}`;
    const preloadedPlayer = preloadedSpotifyPlayers.get(playerKey);
    if (preloadedPlayer) {
      const previousPlayer = spotifyPlayer;
      preloadedPlayer.className = "spotify-player";
      preloadedPlayer.removeAttribute("aria-hidden");
      preloadedPlayer.removeAttribute("tabindex");
      previousPlayer.replaceWith(preloadedPlayer);
      previousPlayer.src = "about:blank";
      previousPlayer.remove();
      spotifyPlayer = preloadedPlayer;
      preloadedSpotifyPlayers.delete(playerKey);
    } else {
      spotifyPlayer.src = spotifyEmbedUrl(songId, itemType);
      spotifyPlayer.title = `Pemutar ${title} di Spotify`;
    }
    document.querySelector(".music-title-display").textContent = title;
    document.querySelector(".music-description").textContent = description;
    document.querySelector(".music-spotify-link").href = spotifyUrl;
    if (recordCover) recordCover.src = cover;
  });
});

videoChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    if (!videoPreview) return;
    if (choice.getAttribute("aria-pressed") === "true") return;

    videoChoices.forEach((videoChoice) => {
      const isSelected = videoChoice === choice;
      videoChoice.classList.toggle("is-active", isSelected);
      videoChoice.setAttribute("aria-pressed", String(isSelected));
    });

    const { videoId, title, description, youtubeUrl } = choice.dataset;
    if (!videoId || !title || !description || !youtubeUrl) return;

    videoPreview.disabled = false;
    videoPreview.dataset.videoId = videoId;
    videoPreview.style.backgroundImage = `url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg')`;
    videoPreview.setAttribute("aria-label", `Putar ${title}`);
    videoPreview.innerHTML =
      '<span class="video-preview-overlay"></span><span class="video-preview-play">▶</span><span class="video-preview-tag">PLAY FAVORITE VIDEO</span>';
    document.querySelector(".video-title").textContent = title;
    document.querySelector(".video-description").textContent = description;
    document.querySelector(".video-youtube-link").href = youtubeUrl;
    animateMediaChange([
      videoPreview,
      document.querySelector(".video-card .favorite-info > div"),
    ]);
  });
});

if (videoPreview) {
  videoPreview.addEventListener("click", () => {
    if (!videoPreview.dataset.videoId) return;

    const player = document.createElement("iframe");
    player.title = "Video favorit Alvian di YouTube";
    player.src =
      `https://www.youtube.com/embed/${videoPreview.dataset.videoId}?autoplay=1&playsinline=1&rel=0`;
    player.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.allowFullscreen = true;
    player.referrerPolicy = "strict-origin-when-cross-origin";
    videoPreview.replaceChildren(player);
    videoPreview.removeAttribute("style");
    videoPreview.setAttribute("aria-label", "Video sedang diputar");
    videoPreview.disabled = true;
  });
}
