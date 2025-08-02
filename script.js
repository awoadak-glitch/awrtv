async function loadContent() {
    const response = await fetch("content.json");
    const data = await response.json();
    const container = document.getElementById("content");

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
        `;
        card.onclick = () => openPlayer(item.stream, item.download, item.subtitle);
        container.appendChild(card);
    });
}

function openPlayer(streamUrl, downloadUrl, subtitleUrl) {
    const modal = document.getElementById("playerModal");
    const video = document.getElementById("videoPlayer");
    const downloadBtn = document.getElementById("downloadBtn");
    modal.style.display = "block";
    downloadBtn.href = downloadUrl;

    if (Hls.isSupported() && streamUrl.endsWith(".m3u8")) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
    } else {
        video.src = streamUrl;
    }

    if(subtitleUrl){
        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = "Arabic";
        track.srclang = "ar";
        track.src = subtitleUrl;
        track.default = true;
        video.appendChild(track);
    }
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("playerModal").style.display = "none";
    const video = document.getElementById("videoPlayer");
    video.pause();
    video.src = "";
}

window.onload = loadContent;
