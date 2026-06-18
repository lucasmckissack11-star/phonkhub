import { createClient } from '@supabase/supabase-js'

// Pulling safe keys from your hidden .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {

  const tracks = [
    { id: "t1", title: "YARA YARA FUNK", artist: "JOKO PHONK", youtube: "https://youtu.be/EkXu0bPHP-0", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/hq720.jpg", defaultVotes: 0 },
    { id: "t2", title: "TIKI TIKI", artist: "QMIIR", youtube: "https://youtu.be/ScMkywEH5JM", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/ab67616d0000b27301913aba303b2a409c0cd157.jpg", defaultVotes: 0 },
    { id: "t3", title: "MONTAGEM ALQUIMIA", artist: "h6itam", youtube: "https://youtu.be/zHm8GFK0m-E", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/artworks-pcTwuvarADB94YKo-1at33A-t500x500.jpg", defaultVotes: 0 },
    { id: "t4", title: "Vem Vem", artist: "Jmilton", youtube: "https://youtu.be/5MzBUJv0US0?si=Do2kK90aJKgFFwCh", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/ab67616d0000b2739c4d42890be9407cf3ab5557.jpg", defaultVotes: 0 },
    { id: "t5", title: "NO BATIDÃO", artist: "ZXKAI", youtube: "https://youtu.be/ZB0amc1TZ3Y?si=y4S9B0aivPB5io6R", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/Zxkai%2C_Slxughter_-_No_Batid%C3%A3o.png", defaultVotes: 0 },
    { id: "t6", title: "MATADORA", artist: "DJ Asul", youtube: "https://youtu.be/YIYBhDeQfT0?si=Ed86njD7tKJeKtmV", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/artworks-g2NqowERzqO1-0-t500x500.jpg", defaultVotes: 0 },
    { id: "t7", title: "PASSO BEM SOLTO", artist: "ATLXS", youtube: "https://youtu.be/KgayxOF4Y7E?si=1aCNVdbd_rw-9A5K", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/Passo_Bem_Solto_-_Atlxs.jpg", defaultVotes: 0 },
    { id: "t8", title: "SHAPE OF YOU FUNK", artist: "fennecxx", youtube: "https://youtu.be/HhK0koY-9Ko?si=3omq5o3vSlrpRxwG", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/shape.jpg", defaultVotes: 0 },
    { id: "t9", title: "HEAVENLY JUMPSTYLE", artist: "INNXCENCE", youtube: "https://youtu.be/aaOaGdxG8uE?si=T1qwKod65iyisI33", image: "https://raw.githubusercontent.com/lucasmckissack11-star/imagesfr/refs/heads/main/images%20(2).jpg", defaultVotes: 0 },
  ];

  let dbVotes = {};
  const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

  const tracksContainer = document.getElementById('tracks');
  const searchInput = document.getElementById('search');
  const modal = document.getElementById('playerModal');
  const iframe = document.getElementById('youtubePlayer');
  const nowPlaying = document.getElementById('nowPlaying');

  async function fetchLiveVotes() {
    const { data, error } = await supabaseClient.from('tracks').select('id, votes');
    if (error) throw error;
    if (data) {
      data.forEach(row => {
        dbVotes[row.id] = row.votes;
      });
    }
  }

  function getCurrentVotes(trackId, defaultVotes) {
    return dbVotes[trackId] !== undefined ? dbVotes[trackId] : defaultVotes;
  }

  function isVotedOnCooldown(trackId) {
    const lastVoteTime = localStorage.getItem(`voted_time_${trackId}`);
    if (!lastVoteTime) return false;

    const timePassed = Date.now() - parseInt(lastVoteTime, 10);
    if (timePassed < COOLDOWN_MS) {
      return true;
    } else {
      localStorage.removeItem(`voted_time_${trackId}`);
      return false;
    }
  }

  function renderTracks(tracksToRender) {
    tracksContainer.innerHTML = '';
    
    const sortedTracks = [...tracksToRender].sort((a, b) => getCurrentVotes(b.id, b.defaultVotes) - getCurrentVotes(a.id, a.defaultVotes));

    sortedTracks.forEach((track, index) => {
      const rank = index + 1;
      const currentVotes = getCurrentVotes(track.id, track.defaultVotes);
      
      const isOnCooldown = isVotedOnCooldown(track.id);
      const upBtnClass = isOnCooldown ? 'text-zinc-700 cursor-not-allowed' : 'text-gray-400 hover:text-orange-500 transition';
      
      const card = document.createElement('div');
      card.className = 'track-card bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer relative';
      card.innerHTML = `
        <div class="rank-badge absolute top-3 left-3 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full shadow-lg z-10">#${rank}</div>
        <div class="relative">
          <img src="${track.image}" class="w-full h-52 object-cover" onerror="this.src='https://via.placeholder.com/300x200/1f2937/ffffff?text=No+Image'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
          <button onclick="playTrack('${track.youtube}', '${track.title}', '${track.artist}')" class="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg z-20">
            <i class="fa-solid fa-play text-xl ml-0.5"></i>
          </button>
        </div>
        <div class="p-4 flex justify-between items-center gap-2">
          <div class="min-w-0">
            <h3 class="font-semibold text-lg leading-tight truncate">${track.title}</h3>
            <p class="text-zinc-400 text-sm mt-1 truncate">${track.artist}</p>
          </div>
          <div class="flex items-center gap-2 bg-zinc-800 rounded-lg border border-zinc-700 px-3 py-1 z-20 shadow-inner">
            <button onclick="handleVote(event, '${track.id}', 1)" class="${upBtnClass} px-1"><i class="fa-solid fa-arrow-up"></i></button>
            <span id="vote-count-${track.id}" class="text-sm font-bold text-white w-8 text-center">${currentVotes}</span>
          </div>
        </div>
      `;
      tracksContainer.appendChild(card);
    });
  }

  // Attached to window so the HTML buttons can still find these functions
  window.handleVote = async function(event, trackId, change) {
    event.stopPropagation();
    
    if (isVotedOnCooldown(trackId)) {
      return;
    }

    localStorage.setItem(`voted_time_${trackId}`, Date.now().toString());
    
    const track = tracks.find(t => t.id === trackId);
    let currentVotes = getCurrentVotes(trackId, track.defaultVotes);
    let newVotes = currentVotes + 1; 
    
    document.getElementById(`vote-count-${trackId}`).textContent = newVotes;
    dbVotes[trackId] = newVotes;
    
    renderTracks(tracks);

    const { error } = await supabaseClient
      .rpc('increment_vote', { track_id: trackId });

    if (error) {
      console.error("Failed to sync vote securely:", error);
      document.getElementById(`vote-count-${trackId}`).textContent = currentVotes;
      dbVotes[trackId] = currentVotes;
      localStorage.removeItem(`voted_time_${trackId}`); 
      renderTracks(tracks);
    }
  };

  window.playTrack = function(url, title, artist) {
    const videoId = url.split('/').pop().split('?')[0];
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    nowPlaying.textContent = `${title} - ${artist}`;
    modal.style.display = 'flex';
  };
  
  window.closePlayer = function() { 
    modal.style.display = 'none'; 
    iframe.src = ''; 
  };

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = term === '' ? tracks : tracks.filter(t => t.title.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term));
    renderTracks(filtered);
  });

  renderTracks(tracks);

  fetchLiveVotes().then(() => {
    renderTracks(tracks); 
  }).catch((err) => {
    console.error("Database connection issue:", err);
  });

});