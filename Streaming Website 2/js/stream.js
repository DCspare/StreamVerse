document.addEventListener("DOMContentLoaded", async function() {
    // Ensure templates are loaded
    if (typeof ensureTemplatesLoaded === "function") {
        await ensureTemplatesLoaded();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const episodeNumber = urlParams.get('episode');

    if (!contentId) {
        console.error("Content ID not found in URL");
        return;
    }

    const content = await getContentById(contentId);
    if (!content) {
        console.error("Content not found");
        return;
    }

    // Set video title
    document.getElementById('videoTitle').textContent = content.title;

    // Set video metadata
    document.getElementById('videoYear').textContent = content.year;
    document.getElementById('videoDuration').textContent = content.duration;
    document.getElementById('videoGenres').textContent = content.genres.join(', ');
    document.getElementById('videoDescription').textContent = content.description;

    // Load media details
    const media = await getMedia(content.mediaRef);
    if (media) {
        // Set video source
        const video = document.getElementById('mainVideo');
        if (episodeNumber && content.type === 'series') {
            const episodes = await getEpisodes(content.episodesRef);
            const episode = episodes.find(ep => ep.episodeNumber === parseInt(episodeNumber));
            if (episode) {
                video.querySelector('source').src = episode.videoUrl;
                video.load();
            }
        } else if (media.trailers && Object.keys(media.trailers).length > 0) {
            // Play first trailer by default
            const firstTrailer = Object.values(media.trailers)[0];
            video.querySelector('source').src = firstTrailer;
            video.load();
        }
    }

    // Load episode selector for series
    if (content.type === 'series') {
        const episodes = await getEpisodes(content.episodesRef);
        if (episodes && episodes.length > 0) {
            const episodeSelector = document.getElementById('episodeSelector');
            episodeSelector.classList.remove('hidden');

            const episodesGrid = document.getElementById('episodesGrid');
            episodes.forEach(episode => {
                const episodeCard = document.createElement('div');
                episodeCard.className = 'episode-card';
                episodeCard.innerHTML = `
                    <img src="${episode.thumbnail}" alt="${episode.title}">
                    <div class="episode-info">
                        <h3>${episode.episodeNumber}. ${episode.title}</h3>
                        <p>${episode.description}</p>
                        <span>${episode.duration}</span>
                    </div>
                `;
                episodeCard.addEventListener('click', () => {
                    window.location.href = `stream.html?id=${contentId}&episode=${episode.episodeNumber}`;
                });
                episodesGrid.appendChild(episodeCard);
            });
        }
    }

    // Load related content
    const relatedContent = await getRelatedContent(contentId);
    const relatedContainer = document.getElementById('relatedContent');
    if (relatedContent && relatedContent.length > 0) {
        relatedContent.forEach(item => {
            const card = createContentCard(item);
            relatedContainer.appendChild(card);
        });
    }
});

async function getMedia(mediaRef) {
    try {
        const response = await fetch(`data/media.json`);
        const mediaData = await response.json();
        return mediaData[mediaRef];
    } catch (error) {
        console.error('Error loading media:', error);
        return null;
    }
}

async function getEpisodes(episodesRef) {
    try {
        const response = await fetch(`data/episodes.json`);
        const episodesData = await response.json();
        return episodesData[episodesRef] || [];
    } catch (error) {
        console.error('Error loading episodes:', error);
        return [];
    }
}

async function getRelatedContent(contentId) {
    const allContent = await getAllContent();
    return allContent
        .filter(item => item.id !== contentId)
        .slice(0, 5);
}
