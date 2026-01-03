const formatMinutes = (minutes) => `${minutes} min ago`;

const getClientConfig = () => {
  const dataset = document.body?.dataset ?? {};
  return {
    appBaseUrl: dataset.appBaseUrl || "http://localhost:3000",
    apiBaseUrl: dataset.apiBaseUrl || dataset.apiBase || "",
    cdnBaseUrl: dataset.cdnBaseUrl || "http://localhost:3000",
    opggBaseUrl: dataset.opggBaseUrl || "https://www.op.gg",
    riotDdragonBase: dataset.riotDdragonBase || "https://ddragon.leagueoflegends.com"
  };
};

const resolveBaseUrl = (base, path) => {
  if (!path) return "";
  if (/^https?:\\/\\//i.test(path)) return path;
  return new URL(path, base).toString();
};

const resolveAppUrl = (path) => resolveBaseUrl(getClientConfig().appBaseUrl, path);
const resolveRiotUrl = (path) => resolveBaseUrl(getClientConfig().riotDdragonBase, path);
const resolveOpggUrl = (path) => resolveBaseUrl(getClientConfig().opggBaseUrl, path);

const renderDirectory = (leaderboards) => {
  const grid = document.querySelector("[data-leaderboard-grid]");
  if (!grid) return;
  grid.innerHTML = "";
  leaderboards
    .filter((board) => board.visibility === "Public")
    .forEach((board) => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = `/leaderboards/detail.html?slug=${board.slug}`;
      card.innerHTML = `
        <span class="badge">Public</span>
        <strong>${board.name}</strong>
        <span>${board.playerCount} players • Updated ${formatMinutes(board.updatedMinutes)}</span>
      `;
      grid.appendChild(card);
    });
};

const renderLeaderboard = (leaderboard) => {
  const title = document.querySelector("[data-leaderboard-title]");
  const description = document.querySelector("[data-leaderboard-description]");
  const refreshed = document.querySelector("[data-leaderboard-refreshed]");
  const shareable = document.querySelector("[data-leaderboard-share]");
  const visibility = document.querySelector("[data-leaderboard-visibility]");
  const visibilityBadge = document.querySelector("[data-leaderboard-visibility-badge]");
  const tableBody = document.querySelector("[data-leaderboard-players]");
  const feed = document.querySelector("[data-latest-feed]");

  if (title) title.textContent = leaderboard.name;
  if (description) description.textContent = leaderboard.description;
  if (refreshed) refreshed.textContent = `Last refreshed ${formatMinutes(leaderboard.updatedMinutes)}.`;
  if (shareable) shareable.textContent = resolveAppUrl(leaderboard.shareableUrl);
  if (visibility) visibility.textContent = `Visibility: ${leaderboard.visibility} • ${leaderboard.visibilityDetail}`;
  if (visibilityBadge) visibilityBadge.textContent = leaderboard.visibility;

  if (tableBody) {
    tableBody.innerHTML = "";
    leaderboard.players.forEach((player) => {
      const row = document.createElement("tr");
      const opggUrl = resolveOpggUrl(`/summoners/na/${player.riotId.replace("#", "-")}`);
      const profileIconUrl = resolveRiotUrl(player.profileIconUrl);
      row.innerHTML = `
        <td data-label="Player">
          <div class="player">
            <div class="avatar"><img src="${profileIconUrl}" alt="${player.riotId} profile icon" /></div>
            <div>
              <strong>${player.riotId}</strong>
              <div style="color:var(--muted);font-size:0.85rem;">
                <a href="${opggUrl}">OP.GG</a> • PUUID stored
              </div>
            </div>
          </div>
        </td>
        <td data-label="Role">${player.role}</td>
        <td data-label="Rank"><span class="rank-pill">${player.rank}</span></td>
        <td data-label="Winrate">
          <div class="winrate">
            <span>${player.wins}W - ${player.losses}L</span>
            <div class="winrate-bar"><span style="width:${player.winratePercent}%;"></span></div>
          </div>
        </td>
        <td data-label="Top Champs">
          <div class="champs">
            ${player.topChamps
              .map(
                (champ) => `
                  <div class="champ-icon">
                    <img src="${resolveRiotUrl(champ.icon)}" alt="${champ.name}" title="${champ.name}" />
                  </div>
                `
              )
              .join("")}
          </div>
        </td>
        <td data-label="Socials">
          <div style="display:grid;gap:0.2rem;">
            ${player.socials
              .map((social) => `<a href="${social.url}">${social.label}</a>`)
              .join("")}
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  if (feed) {
    feed.innerHTML = "";
    leaderboard.latestGames.forEach((game) => {
      const entry = document.createElement("div");
      const badgeClass = game.result === "W" ? "badge positive" : "badge negative";
      entry.className = "feed-item";
      entry.innerHTML = `
        <div>
          <strong>${game.player}</strong>
          <span class="muted">${game.champion} • ${game.timeAgo}</span>
        </div>
        <div>${game.kda}</div>
        <div>CS ${game.cs} • <span class="${badgeClass}">${game.result}</span></div>
        <div>${game.queue} • ${game.duration}</div>
      `;
      feed.appendChild(entry);
    });
  }
};

const renderDashboard = (leaderboard) => {
  const nameInput = document.querySelector("[data-dashboard-name]");
  const descriptionInput = document.querySelector("[data-dashboard-description]");
  const slugInput = document.querySelector("[data-dashboard-slug]");
  const visibilitySelect = document.querySelector("[data-dashboard-visibility]");
  const refreshedBadge = document.querySelector("[data-dashboard-refreshed]");
  const refreshedStatus = document.querySelector("[data-dashboard-status]");
  const playerCount = document.querySelector("[data-dashboard-player-count]");
  const shareButton = document.querySelector("[data-copy]");
  const playerList = document.querySelector("[data-dashboard-players]");

  if (nameInput) nameInput.value = leaderboard.name;
  if (descriptionInput) descriptionInput.value = leaderboard.description;
  if (slugInput) slugInput.value = leaderboard.slug;
  if (visibilitySelect) visibilitySelect.value = leaderboard.visibility;
  if (refreshedBadge) refreshedBadge.textContent = `Last refresh: ${formatMinutes(leaderboard.updatedMinutes)}`;
  if (refreshedStatus) refreshedStatus.textContent = `Status: ${leaderboard.refreshStatus} • Next scheduled in ${leaderboard.nextRefreshMinutes} min`;
  if (playerCount) playerCount.textContent = `Players (${leaderboard.players.length} / 15)`;
  if (shareButton) shareButton.setAttribute("data-copy", resolveAppUrl(leaderboard.shareableUrl));

  if (playerList) {
    playerList.innerHTML = "";
    leaderboard.players.forEach((player) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.padding = "1rem";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "center";
      card.innerHTML = `
        <div>
          <strong>${player.riotId}</strong>
          <span class="muted">${player.role} • ${player.socialsSummary}</span>
        </div>
        <button class="button secondary" type="button">Remove</button>
      `;
      playerList.appendChild(card);
    });
  }
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const getApiBase = () => getClientConfig().apiBaseUrl || document.body?.dataset?.apiBase || "";

const resolveSlug = () => {
  const dataSlug = document.body?.dataset?.leaderboardSlug;
  if (dataSlug) return dataSlug;
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
};

document.addEventListener("DOMContentLoaded", async () => {
  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const copyButton = document.querySelector("[data-copy]");
  if (copyButton) {
    copyButton.addEventListener("click", () => {
      const value = copyButton.getAttribute("data-copy");
      if (!value) {
        return;
      }
      navigator.clipboard.writeText(value).then(() => {
        copyButton.textContent = "Link copied";
        setTimeout(() => {
          copyButton.textContent = "Copy shareable link";
        }, 2000);
      });
    });
  }

  const hasData = document.querySelector("[data-app-data]");
  if (!hasData) return;

  const apiBase = getApiBase();
  const slug = resolveSlug();

  try {
    const leaderboards = await fetchJson(`${apiBase}/leaderboards`);
    renderDirectory(leaderboards);
    if (slug) {
      const leaderboard = await fetchJson(`${apiBase}/leaderboards/${slug}`);
      renderLeaderboard(leaderboard);
    } else if (leaderboards[0]) {
      renderLeaderboard(leaderboards[0]);
    }
    const dashboard = await fetchJson(`${apiBase}/leaderboards/me`);
    renderDashboard(dashboard);
  } catch (error) {
    const fallback = await fetchJson("/assets/data.json");
    renderDirectory(fallback.leaderboards);
    renderLeaderboard(fallback.leaderboards[0]);
    renderDashboard(fallback.leaderboards[0]);
  }
});
