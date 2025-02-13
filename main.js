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
          console.log("No hay eventos disponibles, usando datos dummy.");
          matchesData = getDummyMatches();
          populateMatches(matchesData);
        } else {
          matchesData = data.events.map(transformEvent);
          populateMatches(matchesData);
        }
      } catch (error) {
        console.error("Error al obtener los partidos:", error);
        // En caso de error, usar datos dummy
        matchesData = getDummyMatches();
        populateMatches(matchesData);
      }
    }
  
    // Fallback: Datos dummy en caso de que la API no funcione o no tenga eventos
    function getDummyMatches() {
      return [
        {
          league: "Liga 1",
          homeTeam: "Universitario",
          awayTeam: "Sporting Cristal",
          dateTime: "2025-02-15 19:00",
          analysis: "Universitario domina en casa con solidez y calidad ofensiva.",
          homeStats: {
            victories: 5,
            topScorers: ["Valera (3)", "Quispe (2)"],
            redCards: 1,
            yellowCards: 2,
            injured: ["Juan Pérez"]
          },
          awayStats: {
            victories: 4,
            topScorers: ["Lopez (4)", "García (1)"],
            redCards: 0,
            yellowCards: 1,
            injured: ["Carlos Ruiz"]
          },
          betting: {
            recommendation: "Apostar por la victoria de Universitario y mercado de over 2.5 goles.",
            options: ["Ganador", "Over/Under", "Ambos equipos marcan"],
            assurance: "Universitario es el favorito por su sólido desempeño en casa."
          }
        },
        {
          league: "Liga 1",
          homeTeam: "Alianza Lima",
          awayTeam: "Melgar",
          dateTime: "2025-02-15 21:00",
          analysis: "Alianza Lima presenta un ataque potente pero con problemas de disciplina; Melgar muestra un juego colectivo sólido. Se sugiere un empate o victoria de Melgar.",
          homeStats: {
            victories: 3,
            topScorers: ["Barcos (3)", "Concha (2)"],
            redCards: 2,
            yellowCards: 3,
            injured: ["Lateral X"]
          },
          awayStats: {
            victories: 4,
            topScorers: ["Ramirez (4)", "Torres (1)"],
            redCards: 0,
            yellowCards: 1,
            injured: []
          },
          betting: {
            recommendation: "Apostar a empate o a la doble oportunidad para Melgar.",
            options: ["Empate/Doble Oportunidad", "Más de 2.5 goles"],
            assurance: "Melgar es fuerte en juego colectivo, pero el partido puede cerrarse en empate."
          }
        }
      ];
    }
  
    // Función para transformar el evento obtenido de TheSportsDB a nuestro formato
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
        }
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
              <p class="match-datetime">${item.match.dateTime}</p>
              <button class="btn btn-detail" onclick="showDetail(${item.index})">Ver Análisis</button>
            </div>
          `;
          section.appendChild(card);
        });
        matchListDiv.appendChild(section);
      }
    }
  
    // Función auxiliar para determinar el ganador seguro (sin explicaciones, solo el resultado)
    function getSafeBet(match) {
      const rec = match.betting.recommendation.toLowerCase();
      // Si la recomendación menciona "empate", se asume empate
      if (rec.includes("empate")) {
        return "Empate";
      }
      // Si menciona "victoria de", extraemos el equipo
      const phrase = "victoria de ";
      const idx = rec.indexOf(phrase);
      if (idx !== -1) {
        let substr = match.betting.recommendation.substring(idx + phrase.length);
        // Dividimos por " y " si existe
        let team = substr.split(" y ")[0];
        return team.trim();
      }
      // Por defecto, devolvemos el equipo de casa
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
  