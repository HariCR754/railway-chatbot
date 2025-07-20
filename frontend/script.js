document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const micButton = document.getElementById("mic-button");
  const quickReplies = document.getElementById("quick-replies");
  const clearChatButton = document.getElementById("clear-chat");
  const themeToggle = document.getElementById("theme-toggle");

  // Mock data for demonstration
  const mockTrains = {
    12345: {
      name: "Rajdhani Express",
      departure: "Mumbai",
      destination: "Delhi",
      departure_time: "16:00",
      arrival_time: "08:00",
      duration: "16 hours",
    },
    12346: {
      name: "Shatabdi Express",
      departure: "Bangalore",
      destination: "Chennai",
      departure_time: "06:00",
      arrival_time: "11:00",
      duration: "5 hours",
    },
  };

  const mockFares = {
    "Mumbai-Delhi": {
      "1AC": { base: 3500, reservation: 300, gst: 350 },
      "2AC": { base: 2500, reservation: 200, gst: 250 },
      "3AC": { base: 1500, reservation: 150, gst: 150 },
      SL: { base: 800, reservation: 100, gst: 80 },
      General: { base: 500, reservation: 50, gst: 50 },
    },
    "Bangalore-Chennai": {
      "1AC": { base: 2500, reservation: 250, gst: 250 },
      "2AC": { base: 1500, reservation: 150, gst: 150 },
      "3AC": { base: 1000, reservation: 100, gst: 100 },
      SL: { base: 500, reservation: 50, gst: 50 },
      General: { base: 300, reservation: 30, gst: 30 },
    },
  };

  // Current booking state
  let currentBooking = {
    departure: null,
    destination: null,
    date: null,
    passenger_count: null,
    class_type: null,
  };

  // Initialize chat
  function initChat() {
    setTimeout(() => {
      addBotMessage(
        "🚂 Welcome to RailBuddy! I'm your personal ticket assistant. How can I help you today?"
      );
      showQuickReplies([
        "Book a ticket",
        "Check train schedule",
        "Find fare information",
        "Cancellation policy",
      ]);
    }, 1000);
  }

  // Add message to chat
  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    messageDiv.innerHTML = `${text}<span class="message-time">${time}</span>`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Add bot message with typing indicator
  function addBotMessage(text) {
    // Show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("typing-indicator");
    typingDiv.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Remove typing indicator after delay and show message
    setTimeout(() => {
      chatMessages.removeChild(typingDiv);
      addMessage(text, false);
    }, 1500);
  }

  // Add user message
  function addUserMessage(text) {
    addMessage(text, true);
  }

  // Show quick reply buttons
  function showQuickReplies(replies) {
    quickReplies.innerHTML = "";
    replies.forEach((reply) => {
      const button = document.createElement("button");
      button.classList.add("quick-reply");
      button.textContent = reply;
      button.addEventListener("click", () => {
        addUserMessage(reply);
        processUserInput(reply);
        quickReplies.innerHTML = "";
      });
      quickReplies.appendChild(button);
    });
  }

  // Create booking card
  function createBookingCard(booking) {
    const card = document.createElement("div");
    card.classList.add("booking-card");
    card.innerHTML = `
            <h3>Booking Summary</h3>
            <p><span class="highlight">From:</span> ${
              booking.departure || "Not specified"
            }</p>
            <p><span class="highlight">To:</span> ${
              booking.destination || "Not specified"
            }</p>
            <p><span class="highlight">Date:</span> ${
              booking.date || "Not specified"
            }</p>
            <p><span class="highlight">Passengers:</span> ${
              booking.passenger_count || "Not specified"
            }</p>
            <p><span class="highlight">Class:</span> ${
              booking.class_type || "Not specified"
            }</p>
            <p>Is this information correct?</p>
        `;
    return card;
  }

  // Create schedule card
  function createScheduleCard(trainNumber) {
    const train = mockTrains[trainNumber];
    if (!train) return null;

    const card = document.createElement("div");
    card.classList.add("schedule-card");
    card.innerHTML = `
            <div class="train-name">${train.name} (${trainNumber})</div>
            <div class="timing">
                <div>
                    <div class="highlight">${train.departure}</div>
                    <div>${train.departure_time}</div>
                </div>
                <div>
                    <div class="highlight">${train.destination}</div>
                    <div>${train.arrival_time}</div>
                </div>
            </div>
            <div class="duration">⏱ ${train.duration}</div>
        `;
    return card;
  }

  // Create fare card
  function createFareCard(departure, destination, classType) {
    const route = `${departure}-${destination}`;
    const fare = mockFares[route] && mockFares[route][classType];
    if (!fare) return null;

    const total = fare.base + fare.reservation + fare.gst;

    const card = document.createElement("div");
    card.classList.add("fare-card");
    card.innerHTML = `
            <h3>Fare Details</h3>
            <p>Route: <span class="highlight">${departure} to ${destination}</span></p>
            <p>Class: <span class="highlight">${classType}</span></p>
            <div class="fare-row">
                <span>Base Fare:</span>
                <span>₹${fare.base}</span>
            </div>
            <div class="fare-row">
                <span>+ Reservation:</span>
                <span>₹${fare.reservation}</span>
            </div>
            <div class="fare-row">
                <span>+ GST:</span>
                <span>₹${fare.gst}</span>
            </div>
            <div class="fare-row total-row">
                <span>Total Fare:</span>
                <span>₹${total}</span>
            </div>
        `;
    return card;
  }

  // Process user input
  function processUserInput(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("book") || lowerInput.includes("ticket")) {
      startBookingProcess();
    } else if (lowerInput.includes("schedule") || lowerInput.includes("time")) {
      askForTrainNumber();
    } else if (
      lowerInput.includes("fare") ||
      lowerInput.includes("price") ||
      lowerInput.includes("cost")
    ) {
      askForFareDetails();
    } else if (lowerInput.includes("cancel") || lowerInput.includes("refund")) {
      showCancellationPolicy();
    } else if (
      lowerInput.includes("hello") ||
      lowerInput.includes("hi") ||
      lowerInput.includes("hey")
    ) {
      greetUser();
    } else if (lowerInput.includes("thank")) {
      thankUser();
    } else if (
      currentBooking.departure === null &&
      (input in mockTrains ||
        Object.values(mockTrains).some(
          (t) => t.departure === input || t.destination === input
        ))
    ) {
      // User provided a station name
      currentBooking.departure = input;
      setTimeout(() => {
        addBotMessage("Great! Where would you like to go?");
      }, 1000);
    } else if (
      currentBooking.destination === null &&
      currentBooking.departure !== null
    ) {
      currentBooking.destination = input;
      setTimeout(() => {
        addBotMessage("When are you planning to travel? (DD-MM-YYYY)");
      }, 1000);
    } else if (
      currentBooking.date === null &&
      currentBooking.destination !== null
    ) {
      // Simple date validation
      if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
        currentBooking.date = input;
        setTimeout(() => {
          addBotMessage("How many passengers will be traveling?");
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage("Please enter date in DD-MM-YYYY format.");
        }, 1000);
      }
    } else if (
      currentBooking.passenger_count === null &&
      currentBooking.date !== null
    ) {
      if (/^\d+$/.test(input)) {
        currentBooking.passenger_count = input;
        setTimeout(() => {
          addBotMessage(
            "Which class would you prefer? (1AC, 2AC, 3AC, SL, General)"
          );
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage("Please enter a valid number of passengers.");
        }, 1000);
      }
    } else if (
      currentBooking.class_type === null &&
      currentBooking.passenger_count !== null
    ) {
      const validClasses = ["1AC", "2AC", "3AC", "SL", "General"];
      if (validClasses.includes(input)) {
        currentBooking.class_type = input;
        setTimeout(() => {
          const card = createBookingCard(currentBooking);
          chatMessages.appendChild(card);
          chatMessages.scrollTop = chatMessages.scrollHeight;
          showQuickReplies(["Yes", "No"]);
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage(
            "Please choose from these classes: 1AC, 2AC, 3AC, SL, General"
          );
        }, 1000);
      }
    } else if (lowerInput === "yes" && currentBooking.class_type !== null) {
      // Complete booking
      setTimeout(() => {
        const pnr = "RAIL" + Math.floor(100000 + Math.random() * 900000);
        const route = `${currentBooking.departure}-${currentBooking.destination}`;
        const fare =
          mockFares[route] && mockFares[route][currentBooking.class_type];
        const totalFare = fare
          ? (fare.base + fare.reservation + fare.gst) *
            currentBooking.passenger_count
          : 6500;

        addBotMessage(`🎉 Your booking is confirmed!<br><br>
                    🔢 PNR: ${pnr}<br>
                    💵 Amount Paid: ₹${totalFare}<br><br>
                    You'll receive an SMS with details. Safe travels!`);

        // Reset booking
        currentBooking = {
          departure: null,
          destination: null,
          date: null,
          passenger_count: null,
          class_type: null,
        };
      }, 1000);
    } else if (lowerInput === "no" && currentBooking.class_type !== null) {
      setTimeout(() => {
        addBotMessage(
          "Okay, let's start over. From which station would you like to depart?"
        );
        currentBooking = {
          departure: null,
          destination: null,
          date: null,
          passenger_count: null,
          class_type: null,
        };
      }, 1000);
    } else if (/^\d{5}$/.test(input)) {
      // Assume it's a train number
      const train = mockTrains[input];
      setTimeout(() => {
        if (train) {
          const card = createScheduleCard(input);
          if (card) {
            chatMessages.appendChild(card);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } else {
          addBotMessage(`Sorry, I couldn't find schedule for train ${input}.`);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        addBotMessage(
          "I'm here to help with railway bookings. You can ask me about:<br>" +
            "- Booking tickets<br>" +
            "- Train schedules<br>" +
            "- Fare information<br>" +
            "- Cancellation policies"
        );
        showQuickReplies([
          "Book a ticket",
          "Check train schedule",
          "Find fare information",
          "Cancellation policy",
        ]);
      }, 1000);
    }
  }

  // Booking process functions
  function startBookingProcess() {
    currentBooking = {
      departure: null,
      destination: null,
      date: null,
      passenger_count: null,
      class_type: null,
    };
    setTimeout(() => {
      addBotMessage(
        "Great! Let's book your ticket. Which station are you departing from?"
      );
    }, 1000);
  }

  function askForTrainNumber() {
    setTimeout(() => {
      addBotMessage(
        "I can help with train schedules. Could you please provide the train number you're interested in?"
      );
      addBotMessage(
        "For example: 12345 (Rajdhani Express) or 12346 (Shatabdi Express)"
      );
    }, 1000);
  }

  function askForFareDetails() {
    setTimeout(() => {
      addBotMessage(
        "I can provide fare information. What is your departure station?"
      );
    }, 1000);
  }

  function showCancellationPolicy() {
    setTimeout(() => {
      addBotMessage(
        "📝 Cancellation Policy:<br><br>" +
          "- 48+ hrs before: 25% charge<br>" +
          "- 12-48 hrs before: 50% charge<br>" +
          "- Less than 12 hrs: No refund"
      );
    }, 1000);
  }

  function greetUser() {
    setTimeout(() => {
      addBotMessage(
        "Hi there! How can I assist you with your railway travel today?"
      );
      showQuickReplies([
        "Book a ticket",
        "Check train schedule",
        "Find fare information",
        "Cancellation policy",
      ]);
    }, 1000);
  }

  function thankUser() {
    setTimeout(() => {
      addBotMessage(
        "You're welcome! Is there anything else I can help you with?"
      );
    }, 1000);
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addUserMessage(message);
      userInput.value = "";
      processUserInput(message);
    }
  }

  // Speech recognition
  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.addEventListener("click", () => {
      recognition.start();
      micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      micButton.style.backgroundColor = "var(--accent-color)";
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      sendMessage();
    };

    recognition.onend = () => {
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
      micButton.style.backgroundColor = "var(--secondary-color)";
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
      micButton.style.backgroundColor = "var(--secondary-color)";
    };
  } else {
    micButton.style.display = "none";
  }

  // Clear chat
  clearChatButton.addEventListener("click", () => {
    chatMessages.innerHTML = "";
    currentBooking = {
      departure: null,
      destination: null,
      date: null,
      passenger_count: null,
      class_type: null,
    };
    initChat();
  });

  // Theme toggle
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.body.removeAttribute("data-theme");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.setAttribute("data-theme", "dark");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  });

  // Initialize chat
  initChat();

  // Demo booking flow (for presentation)
  function demoBookingFlow() {
    setTimeout(() => {
      addBotMessage("Let me show you how booking works...");
    }, 1500);

    setTimeout(() => {
      addUserMessage("Book a ticket");
    }, 3500);

    setTimeout(() => {
      addBotMessage(
        "Great! Let's book your ticket. Which station are you departing from?"
      );
    }, 5000);

    setTimeout(() => {
      addUserMessage("Mumbai");
    }, 7000);

    setTimeout(() => {
      addBotMessage("Where would you like to go?");
    }, 8500);

    setTimeout(() => {
      addUserMessage("Delhi");
    }, 10500);

    setTimeout(() => {
      addBotMessage("When are you planning to travel? (DD-MM-YYYY)");
    }, 12500);

    setTimeout(() => {
      addUserMessage("15-08-2023");
    }, 14500);

    setTimeout(() => {
      addBotMessage("How many passengers will be traveling?");
    }, 16500);

    setTimeout(() => {
      addUserMessage("2");
    }, 18500);

    setTimeout(() => {
      addBotMessage(
        "Which class would you prefer? (1AC, 2AC, 3AC, SL, General)"
      );
    }, 20500);

    setTimeout(() => {
      addUserMessage("2AC");
    }, 22500);

    setTimeout(() => {
      const card = createBookingCard({
        departure: "Mumbai",
        destination: "Delhi",
        date: "15-08-2023",
        passenger_count: "2",
        class_type: "2AC",
      });
      chatMessages.appendChild(card);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      showQuickReplies(["Yes", "No"]);
    }, 24500);

    setTimeout(() => {
      addUserMessage("Yes");
    }, 26500);

    setTimeout(() => {
      addBotMessage(`🎉 Your booking is confirmed!<br><br>
                🔢 PNR: RAIL${Math.floor(100000 + Math.random() * 900000)}<br>
                💵 Amount Paid: ₹5500<br><br>
                You'll receive an SMS with details. Safe travels!`);
    }, 28500);
  }

  // Uncomment to run demo automatically
  // demoBookingFlow();
});
