class StateUpdater {
  constructor() {
      this.lastTimestamp = null;
  }

  updateState(surfaceArea, coefficientDrag, massKg, altitudeM, timestamp, initialVelocity, airDensity) {
      let newAccelY;
      if (initialVelocity < 0) {
          newAccelY = -9.81;
      } else {
          const forceDrag = 0.5 * airDensity * (initialVelocity ** 2) * coefficientDrag * surfaceArea;
          newAccelY = -(forceDrag / massKg) - 9.81;
      }

      let dt = (this.lastTimestamp !== null) ? (timestamp - this.lastTimestamp) / 1000 : 0;  // Convert ms to s
      this.lastTimestamp = timestamp;

      const realVelocity = initialVelocity + newAccelY * dt;
      const newAltitudeM = altitudeM + realVelocity * dt;

      return { accelY: newAccelY + 9.81, altitude: newAltitudeM, velocity: realVelocity };
  }

  calculateSurfaceAreaForAirbrakeAngle(airbrakeAngle, rocketSurfaceArea) {
      const a = -5.89 * 10**-7;
      const b = 1.51 * 10**-4;
      const c = -9.42 * 10**-7;
      return a * airbrakeAngle**2 + b * airbrakeAngle + c + rocketSurfaceArea;
  }

  calculateCdForAirbrakeAngle(airbrakeAngle) {
      return (3.95 * 10**-3) * airbrakeAngle + 0.6;
  }
}

class RocketGame extends Phaser.Scene {
  constructor() {
      super({ key: 'RocketGame' });
      this.stateUpdater = new StateUpdater();
      this.chart = null;
      this.isUpdating = false;
      this.initialVelocity = 100;
      this.initialAltitude = 200 * 0.3048;
      this.airbrakeAngle = 0;
      this.targetAltitudeFeet = 800;
      this.startTime = null;  // Store the start time of the simulation
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();


    // Add button handlers
    this.addButtonHandlers();
  }

  addButtonHandlers() {
    const buttonsContainer = document.getElementById('buttons');
    const gameRulesText = document.getElementById('gameRules');
    const qualificationForm = document.getElementById('qualificationForm');

    document.getElementById('practiceButton').addEventListener('click', () => {
      this.startCountdown();
      buttonsContainer.style.display = 'none';
      gameRulesText.style.display = 'none';
      document.querySelector('.blurred-background').style.display = 'block'; // Show blurred background
  });
  
  document.getElementById('qualifyButton').addEventListener('click', () => {
      qualificationForm.style.display = 'block';
      buttonsContainer.style.display = 'none';
      gameRulesText.style.display = 'none';
      document.querySelector('.blurred-background').style.display = 'block'; // Show blurred background
  });
  
  document.getElementById('leaderboardButton').addEventListener('click', () => {
      console.log("Leaderboard button clicked");
      buttonsContainer.style.display = 'none';
      gameRulesText.style.display = 'none';
      document.querySelector('.blurred-background').style.display = 'block'; // Show blurred background
  });

    // Qualification form submission handler
    document.getElementById('qualifyForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting normally
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        // Hide form and save the player's name
        qualificationForm.style.display = 'none';
        this.playerName = `${firstName} ${lastName}`;

        // Start the game countdown
        this.startCountdown();
    });

      // Hide blurred background when closing these views or starting the game
    document.getElementById('resetButton').addEventListener('click', () => {
      window.location.reload();  // Reload the page to reset the game
      document.querySelector('.blurred-background').style.display = 'none'; // Hide blurred background
    });

    document.getElementById('leaderboardButton').addEventListener('click', () => {
      const scores = JSON.parse(localStorage.getItem('rocketGameScores')) || [];
      // Filter out entries without a valid name and sort by proximity to 800 feet
      const validScores = scores.filter(entry => entry.name && entry.name.trim().length > 0);
      validScores.sort((a, b) => Math.abs(800 - a.score) - Math.abs(800 - b.score));
  
      const leaderboardEntries = document.getElementById('leaderboardEntries');
      leaderboardEntries.innerHTML = ''; // Clear previous entries
  
      // Generate HTML for each valid entry
      validScores.forEach((entry, index) => {
          const entryElement = document.createElement('div');
          entryElement.style = "margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;";
          entryElement.textContent = `${index + 1}. ${entry.name} - ${entry.score.toFixed(2)} feet`;
          leaderboardEntries.appendChild(entryElement);
      });
  
      document.getElementById('leaderboard').style.display = 'block'; // Show the leaderboard
    });
}

  startCountdown() {
    let countdownValue = 3;
    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    document.querySelector('.blurred-background').style.display = 'block'; // Show blurred background during countdown
    const countdownInterval = setInterval(() => {
        countdownElement.textContent = countdownValue;
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            document.querySelector('.blurred-background').style.display = 'none'; // Hide blurred background when game starts
            this.initChart();
            this.isUpdating = true;
            this.startTime = performance.now(); // Set the start time at the end of countdown
        }
        countdownValue--;
    }, 1000);
  }

  update(time) {
    if (this.isUpdating && (!this.lastUpdateTime || time - this.lastUpdateTime > 1)) {
        const currentTime = time - this.startTime; // Calculate current time relative to the start time
        if (this.cursors.up.isDown) {
            this.airbrakeAngle = Math.min(this.airbrakeAngle + 5, 73);
        } else if (this.cursors.down.isDown) {
            this.airbrakeAngle = Math.max(this.airbrakeAngle - 5, 0);
        }

        const surfaceArea = this.stateUpdater.calculateSurfaceAreaForAirbrakeAngle(this.airbrakeAngle, 0.004657);
        const coefficientDrag = this.stateUpdater.calculateCdForAirbrakeAngle(this.airbrakeAngle);
        const state = this.stateUpdater.updateState(surfaceArea, coefficientDrag, 0.6, this.initialAltitude, currentTime, this.initialVelocity, 1.225);

        this.initialVelocity = state.velocity;
        this.initialAltitude = state.altitude;
        this.updateChart(currentTime, state.altitude * 3.28084, this.airbrakeAngle);

        this.lastUpdateTime = time;

        if (state.velocity <= 0) {
            this.isUpdating = false;
            this.displayAltitudeDifference();
        }
    }
}

  displayAltitudeDifference() {
    const finalAltitudeFeet = this.initialAltitude * 3.28084;
    const difference = finalAltitudeFeet - this.targetAltitudeFeet;
    const scoreText = `Your score: ${difference.toFixed(2)} feet ${(difference < 0 ? "below" : "above")} the target altitude of ${this.targetAltitudeFeet} feet.`;
    document.getElementById('scoreDisplay').textContent = scoreText;
    document.getElementById('endGameModal').style.display = 'block';

    // Prepare data to be stored
    const scoreData = {
        name: this.playerName,
        score: finalAltitudeFeet
    };

    // Retrieve existing scores from local storage, or initialize if not present
    const scores = JSON.parse(localStorage.getItem('rocketGameScores')) || [];
    scores.push(scoreData);
    localStorage.setItem('rocketGameScores', JSON.stringify(scores));
  }

  initChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Altitude (ft)',
          borderColor: 'rgb(255, 99, 132)',
          pointRadius: 0,
          data: []
        }, {
          label: 'Airbrake Angle (degrees)',
          borderColor: 'rgb(75, 192, 192)',
          pointRadius: 0,
          data: []
        }, {
          label: 'Target Altitude (800 ft)',
          borderColor: 'rgb(100, 100, 100)',
          pointRadius: 0,
          borderDash: [10, 5],
          data: Array(1000).fill(800),
          fill: false
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: 6200,
            ticks: {
              callback: function(value) {
                return (value / 1000).toFixed(2) + 's';  // Convert milliseconds to seconds
              }
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 1000,
            ticks: {
              stepSize: 100
            }
          }
        },
        animations: {
          tension: {
            duration: 0, // Disables animation for line tension adjustments
          },
          x: {
            type: 'number',
            easing: 'linear',
            duration: 0 // Disables animation on the x-axis
          },
          y: {
            type: 'number',
            easing: 'linear',
            duration: 0 // Disables animation on the y-axis
          }
        }
      }
    });
  }

updateChart(timestamp, altitude, airbrakeAngle) {
    const maxDataPoints = 10000; // Set max number of data points displayed at a time
    this.chart.data.labels.push(timestamp);
    this.chart.data.datasets[0].data.push(altitude);
    this.chart.data.datasets[1].data.push(airbrakeAngle);

    if (this.chart.data.labels.length > maxDataPoints) {
        this.chart.data.labels.shift();
        this.chart.data.datasets.forEach(dataset => {
            dataset.data.shift();
        });
    }
    this.chart.update();
}}

const config = {
  type: Phaser.AUTO,
  width: 0,
  height: 0,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },
  scene: [RocketGame]
};

const game = new Phaser.Game(config);