document.addEventListener("DOMContentLoaded", () => {
  let matchesData = [];

  // Función para obtener partidos desde TheSportsDB para la liga de Perú (id=4391)
  async function fetchMatches() {
    try {
      const response = await fetch('https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=4391');
      if (!response.ok) throw new Error("Error en la respuesta de la API");
      const data = await response.json();
      // Si la API no devuelve eventos, usar dummy data
      if (!data.events || data.events.length === 0) {
        console.log("No hay eventos disponibles, usando datos dummy reales.");
        matchesData = getRealMatchesFallback();
        populateMatches(matchesData);
      } else {
        matchesData = data.events.map(transformEvent);
        populateMatches(matchesData);
      }
    } catch (error) {
      console.error("Error al obtener los partidos:", error);
      // En caso de error, usar datos dummy reales
      matchesData = getRealMatchesFallback();
      populateMatches(matchesData);
    }
  }

  // Fallback con datos reales de las 5 jornadas próximas (según lo dado)
  function getRealMatchesFallback() {
    return [
      {
        league: "Apertura · Jornada 2 de 19",
        homeTeam: "Cusco",
        awayTeam: "Melgar",
        dateTime: "Hoy 5:30 p.m.",
        analysis: "Cusco enfrenta a Melgar; este partido ya está en curso.",
        homeStats: { victories: 2, topScorers: ["–"], redCards: 0, yellowCards: 1, injured: [] },
        awayStats: { victories: 2, topScorers: ["–"], redCards: 0, yellowCards: 1, injured: [] },
        betting: {
          recommendation: "Apostar por la victoria de Cusco.",
          options: ["Ganador", "Over/Under"],
          assurance: "Cusco llega en mejor forma."
        },
        estado: "en curso"
      },
      {
        league: "Apertura · Jornada 2 de 19",
        homeTeam: "UTC Cajamarca",
        awayTeam: "Binacional",
        dateTime: "Mañana 11:00 a.m.",
        analysis: "UTC Cajamarca busca sumar puntos, Binacional necesita recuperarse.",
        homeStats: { victories: 3, topScorers: ["–"], redCards: 0, yellowCards: 2, injured: [] },
        awayStats: { victories: 2, topScorers: ["–"], redCards: 1, yellowCards: 1, injured: [] },
        betting: {
          recommendation: "Apostar por empate con pocos goles.",
          options: ["Empate", "Under 2.5 goles"],
          assurance: "La defensa de ambos equipos es sólida."
        },
        estado: "próximo"
      },
      {
        league: "Apertura · Jornada 2 de 19",
        homeTeam: "ADT",
        awayTeam: "Atlético Grau",
        dateTime: "Mañana 1:00 p.m.",
        analysis: "ADT busca aprovechar su localía, mientras que Atlético Grau lucha por mejorar su rendimiento.",
        homeStats: { victories: 2, topScorers: ["–"], redCards: 0, yellowCards: 2, injured: [] },
        awayStats: { victories: 1, topScorers: ["–"], redCards: 0, yellowCards: 3, injured: [] },
        betting: {
          recommendation: "Apostar por la victoria de ADT.",
          options: ["Ganador", "Ambos equipos marcan"],
          assurance: "ADT se desempeña mejor en casa."
        },
        estado: "próximo"
      },
      {
        league: "Apertura · Jornada 2 de 19",
        homeTeam: "Alianza Atlético",
        awayTeam: "Alianza Lima",
        dateTime: "Mañana 7:30 p.m.",
        analysis: "Alianza Atlético y Alianza Lima se enfrentan en un duelo clave; se espera que los locales intenten sorprender.",
        homeStats: { victories: 2, topScorers: ["–"], redCards: 0, yellowCards: 1, injured: [] },
        awayStats: { victories: 3, topScorers: ["–"], redCards: 0, yellowCards: 1, injured: [] },
        betting: {
          recommendation: "Apostar por la victoria de Alianza Lima.",
          options: ["Ganador", "Over/Under"],
          assurance: "Alianza Lima tiene mejor historial reciente."
        },
        estado: "próximo"
      },
      {
        league: "Apertura · Jornada 3 de 19",
        homeTeam: "Alianza Lima",
        awayTeam: "Juan Pablo II College",
        dateTime: "Vie, 21/2 8:00 p.m.",
        analysis: "En jornada 3, Alianza Lima se enfrenta a Juan Pablo II College. Se espera un partido con alta intensidad.",
        homeStats: { victories: 3, topScorers: ["–"], redCards: 0, yellowCards: 1, injured: [] },
        awayStats: { victories: 1, topScorers: ["–"], redCards: 0, yellowCards: 2, injured: [] },
        betting: {
          recommendation: "Apostar por la victoria de Alianza Lima.",
          options: ["Ganador", "Over 2.5 goles"],
          assurance: "Alianza Lima posee jugadores de mayor calidad."
        },
        estado: "próximo"
      }
    ];
  }

  // Transformar el evento obtenido de TheSportsDB a nuestro formato
  function transformEvent(event) {
    return {
      league: event.strLeague || "Liga 1",
      homeTeam: event.strHomeTeam || "Equipo Casa",
      awayTeam: event.strAwayTeam || "Equipo Visitante",
      dateTime: (event.dateEvent ? event.dateEvent : "Fecha no disponible") + " " + (event.strTime ? event.strTime.substring(0,5) : ""),
      analysis: "Análisis en vivo: " + (event.strEvent || "Partido sin datos.") + ". Se espera un encuentro competitivo.",
      homeStats: {
        victories: 4,
        topScorers: ["Jugador A (2)", "Jugador B (1)"],
        redCards: 1,
        yellowCards: 2,
        injured: ["Jugador X"]
      },
      awayStats: {
        victories: 3,
        topScorers: ["Jugador C (3)", "Jugador D (1)"],
        redCards: 0,
        yellowCards: 1,
        injured: []
      },
      betting: {
        recommendation: "Apostar por la victoria de " + (event.strHomeTeam || "Equipo Casa") + " y mercado de over 2.5 goles.",
        options: ["Ganador", "Over/Under", "Ambos equipos marcan"],
        assurance: (event.strHomeTeam || "Equipo Casa") + " es el favorito por su racha y localía."
      },
      estado: "próximo"
    };
  }

  // Función para generar la lista de partidos agrupados por liga
  function populateMatches(matches) {
    const matchListDiv = document.getElementById("matchList");
    matchListDiv.innerHTML = "";
    const leagues = {};
    matches.forEach((match, index) => {
      if (!leagues[match.league]) {
        leagues[match.league] = [];
      }
      leagues[match.league].push({ match, index });
    });
    for (const league in leagues) {
      const section = document.createElement("div");
      section.className = "league-section";
      const title = document.createElement("h2");
      title.className = "league-title";
      title.textContent = league;
      section.appendChild(title);
      leagues[league].forEach(item => {
        const card = document.createElement("div");
        card.className = "card match-card";
        card.innerHTML = `
          <div class="card-content">
            <h3 class="match-title">${item.match.homeTeam} vs. ${item.match.awayTeam}</h3>
            <p class="match-datetime">${item.match.dateTime} (${item.match.estado})</p>
            <button class="btn btn-detail" onclick="showDetail(${item.index})">Ver Análisis</button>
          </div>
        `;
        section.appendChild(card);
      });
      matchListDiv.appendChild(section);
    }
  }

  // Función auxiliar para determinar el ganador seguro (solo muestra quién gana, estilo "casinero")
  function getSafeBet(match) {
    const rec = match.betting.recommendation.toLowerCase();
    if (rec.includes("empate")) {
      return "Empate";
    }
    const phrase = "victoria de ";
    const idx = rec.indexOf(phrase);
    if (idx !== -1) {
      let substr = match.betting.recommendation.substring(idx + phrase.length);
      let team = substr.split(" y ")[0];
      return team.trim();
    }
    return match.homeTeam;
  }

  // Función para mostrar el detalle del partido con secciones separadas y "Apuesta Segura"
  function showDetail(index) {
    const match = matchesData[index];
    const detailContent = document.getElementById("detailContent");
    detailContent.innerHTML = `
      <h2 class="detail-title">${match.homeTeam} vs. ${match.awayTeam}</h2>
      <p class="detail-datetime">${match.dateTime}</p>
      
      <div class="detail-section">
        <h3 class="section-title">Estadísticas de ${match.homeTeam}</h3>
        <p><strong>Victorias:</strong> ${match.homeStats.victories}</p>
        <p><strong>Top Goleadores:</strong> ${match.homeStats.topScorers.join(", ")}</p>
        <p><strong>Tarjetas Rojas:</strong> ${match.homeStats.redCards}</p>
        <p><strong>Tarjetas Amarillas:</strong> ${match.homeStats.yellowCards}</p>
        <p><strong>Lesionados:</strong> ${match.homeStats.injured.length > 0 ? match.homeStats.injured.join(", ") : "Ninguno"}</p>
      </div>
      
      <div class="detail-section">
        <h3 class="section-title">Estadísticas de ${match.awayTeam}</h3>
        <p><strong>Victorias:</strong> ${match.awayStats.victories}</p>
        <p><strong>Top Goleadores:</strong> ${match.awayStats.topScorers.join(", ")}</p>
        <p><strong>Tarjetas Rojas:</strong> ${match.awayStats.redCards}</p>
        <p><strong>Tarjetas Amarillas:</strong> ${match.awayStats.yellowCards}</p>
        <p><strong>Lesionados:</strong> ${match.awayStats.injured.length > 0 ? match.awayStats.injured.join(", ") : "Ninguno"}</p>
      </div>
      
      <div class="detail-section">
        <h3 class="section-title">Recomendaciones de Apuesta</h3>
        <p><strong>Recomendación:</strong> ${match.betting.recommendation}</p>
        <p><strong>Opciones:</strong> ${match.betting.options.join(", ")}</p>
        <p><strong>Aseguradora:</strong> ${match.betting.assurance}</p>
      </div>
      
      <div class="detail-section">
        <h3 class="section-title">Apuesta Segura</h3>
        <p><strong>Ganador Seguro:</strong> ${getSafeBet(match)}</p>
      </div>
    `;
    document.getElementById("matchList").style.display = "none";
    document.getElementById("detailView").style.display = "block";
  }

  window.showDetail = showDetail;

  document.getElementById("backButton").addEventListener("click", () => {
    document.getElementById("detailView").style.display = "none";
    document.getElementById("matchList").style.display = "block";
  });

  async function updateMatches() {
    await fetchMatches();
  }

  updateMatches();
  setInterval(updateMatches, 60000);
});
