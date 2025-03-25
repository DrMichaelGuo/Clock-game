document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Audio elements
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const completeSound = document.getElementById('complete-sound');
    
    // Learn section - Demo clock
    const learnClock = document.querySelector('.learn-clock');
    const demoHourHand = learnClock.querySelector('.hour');
    const demoMinuteHand = learnClock.querySelector('.minute');
    const demoHourButton = document.getElementById('demo-hour');
    const demoMinuteButton = document.getElementById('demo-minute');
    
    let hourPosition = 0;
    let minutePosition = 0;
    
    demoHourButton.addEventListener('click', () => {
        hourPosition += 30; // 360 / 12 = 30 degrees per hour
        if (hourPosition >= 360) hourPosition = 0;
        demoHourHand.style.transform = `translate(-50%, 0) rotate(${hourPosition}deg)`;
    });
    
    demoMinuteButton.addEventListener('click', () => {
        minutePosition += 30; // 360 / 12 = 30 degrees (for demo purposes we move by 5 minutes at a time)
        if (minutePosition >= 360) minutePosition = 0;
        demoMinuteHand.style.transform = `translate(-50%, 0) rotate(${minutePosition}deg)`;
    });
    
    // Practice section - Draggable hands
    const practiceClock = document.querySelector('.practice-clock');
    const practiceHourHand = document.getElementById('practice-hour');
    const practiceMinuteHand = document.getElementById('practice-minute');
    const checkButton = document.getElementById('check-time');
    const practiceFeedback = document.getElementById('practice-feedback');
    const targetTimeElement = document.getElementById('target-time');
    
    let targetHour, targetMinute;
    let isDragging = false;
    let activeDraggable = null;
    let initialAngle = 0;
    
    // Set a random target time
    function setTargetTime() {
        targetHour = Math.floor(Math.random() * 12) + 1; // 1-12
        targetMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        
        let displayMinute = targetMinute < 10 ? '0' + targetMinute : targetMinute;
        targetTimeElement.textContent = `${targetHour}:${displayMinute}`;
        
        // Reset hands
        practiceHourHand.style.transform = `translate(-50%, 0) rotate(0deg)`;
        practiceMinuteHand.style.transform = `translate(-50%, 0) rotate(0deg)`;
        
        // Hide feedback
        practiceFeedback.className = 'feedback';
        practiceFeedback.style.display = 'none';
    }
    
    // Initialize with a target time
    setTargetTime();
    
    // Make the clock hands draggable
    document.querySelectorAll('.draggable').forEach(draggable => {
        draggable.addEventListener('mousedown', startDrag);
        draggable.addEventListener('touchstart', startDrag);
    });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        activeDraggable = e.target;
        
        const rect = activeDraggable.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (e.type === 'touchstart') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        initialAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        initialAngle = (initialAngle + 90) % 360;
        if (initialAngle < 0) initialAngle += 360;
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const rect = activeDraggable.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        angle = (angle + 90) % 360;
        if (angle < 0) angle += 360;
        
        // Snap to increments
        if (activeDraggable.classList.contains('hour')) {
            angle = Math.round(angle / 30) * 30; // 30 degrees per hour
        } else if (activeDraggable.classList.contains('minute')) {
            angle = Math.round(angle / 6) * 6; // 6 degrees per minute
        }
        
        activeDraggable.style.transform = `translate(-50%, 0) rotate(${angle}deg)`;
    }
    
    function endDrag() {
        isDragging = false;
        activeDraggable = null;
    }
    
    checkButton.addEventListener('click', () => {
        // Get current angles
        const hourTransform = practiceHourHand.style.transform;
        const minuteTransform = practiceMinuteHand.style.transform;
        
        const hourAngle = parseInt(hourTransform.match(/rotate\((\d+)deg\)/)[1]) || 0;
        const minuteAngle = parseInt(minuteTransform.match(/rotate\((\d+)deg\)/)[1]) || 0;
        
        // Convert angles to hours and minutes
        const hour = (hourAngle / 30) % 12 || 12; // 30 degrees per hour
        const minute = (minuteAngle / 6) % 60; // 6 degrees per minute
        
        // Check if it matches the target time
        const hourCorrect = Math.abs(hour - targetHour) < 0.5 || Math.abs(hour - targetHour) > 11.5;
        const minuteCorrect = Math.abs(minute - targetMinute) < 2.5 || Math.abs(minute - targetMinute) > 57.5;
        
        if (hourCorrect && minuteCorrect) {
            practiceFeedback.textContent = "Correct! Well done!";
            practiceFeedback.className = 'feedback success';
            practiceFeedback.style.display = 'block';
            correctSound.play();
            
            // Set a new target time after a brief delay
            setTimeout(setTargetTime, 2000);
        } else {
            practiceFeedback.textContent = "Not quite right, try again!";
            practiceFeedback.className = 'feedback error';
            practiceFeedback.style.display = 'block';
            wrongSound.play();
        }
    });
    
    // Multiple choice practice
    const mcClock = document.querySelector('.mc-clock');
    const mcHourHand = mcClock.querySelector('.hour');
    const mcMinuteHand = mcClock.querySelector('.minute');
    const mcOptions = document.querySelectorAll('.mc-option');
    const mcFeedback = document.getElementById('mc-feedback');
    
    let mcCurrentHour, mcCurrentMinute, mcCorrectAnswer;
    
    function setMCQuestion() {
        mcCurrentHour = Math.floor(Math.random() * 12) + 1; // 1-12
        
        // We'll use quarter hours for simplicity
        const minuteOptions = [0, 15, 30, 45];
        mcCurrentMinute = minuteOptions[Math.floor(Math.random() * 4)];
        
        // Set clock hands
        const hourAngle = ((mcCurrentHour % 12) * 30) + (mcCurrentMinute / 2); // 30 degrees per hour + minute adjustment
        const minuteAngle = mcCurrentMinute * 6; // 6 degrees per minute
        
        mcHourHand.style.transform = `translate(-50%, 0) rotate(${hourAngle}deg)`;
        mcMinuteHand.style.transform = `translate(-50%, 0) rotate(${minuteAngle}deg)`;
        
        // Create answer options (1 correct, 3 wrong)
        const displayMinute = mcCurrentMinute < 10 ? '0' + mcCurrentMinute : mcCurrentMinute;
        mcCorrectAnswer = `${mcCurrentHour}:${displayMinute}`;
        
        // Generate 3 wrong answers
        let wrongAnswers = [];
        while (wrongAnswers.length < 3) {
            let wrongHour = Math.floor(Math.random() * 12) + 1;
            let wrongMinute = minuteOptions[Math.floor(Math.random() * 4)];
            let wrongDisplayMinute = wrongMinute < 10 ? '0' + wrongMinute : wrongMinute;
            let wrongAnswer = `${wrongHour}:${wrongDisplayMinute}`;
            
            if (wrongAnswer !== mcCorrectAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        // Combine answers and shuffle
        let allAnswers = [...wrongAnswers, mcCorrectAnswer];
        allAnswers = shuffleArray(allAnswers);
        
        // Populate options
        mcOptions.forEach((option, index) => {
            option.textContent = allAnswers[index];
            option.classList.remove('selected');
            
            // Add click handler
            option.onclick = function() {
                mcOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                if (this.textContent === mcCorrectAnswer) {
                    mcFeedback.textContent = "Correct! Well done!";
                    mcFeedback.className = 'feedback success';
                    mcFeedback.style.display = 'block';
                    correctSound.play();
                    
                    // Set new question after brief delay
                    setTimeout(setMCQuestion, 1500);
                } else {
                    mcFeedback.textContent = "Not quite right, try again!";
                    mcFeedback.className = 'feedback error';
                    mcFeedback.style.display = 'block';
                    wrongSound.play();
                }
            };
        });
        
        // Hide feedback
        mcFeedback.style.display = 'none';
    }
    
    // Initialize multiple choice
    setMCQuestion();
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Quiz section
    const quizClock = document.querySelector('.quiz-clock');
    const quizHourHand = document.getElementById('quiz-hour');
    const quizMinuteHand = document.getElementById('quiz-minute');
    const quizQuestion = document.getElementById('quiz-question');
    const quizSubmit = document.getElementById('quiz-submit');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizOptions = document.getElementById('quiz-options');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const quizContainer = document.getElementById('quiz-container');
    const quizResults = document.getElementById('quiz-results');
    const quizScore = document.getElementById('quiz-score');
    const quizTotal = document.getElementById('quiz-total');
    const starsContainer = document.getElementById('stars-container');
    const finalMessage = document.getElementById('final-message');
    const restartQuiz = document.getElementById('restart-quiz');
    
    const totalQuestions = 5;
    let currentQuestion = 1;
    let score = 0;
    let quizQuestions = [];
    let currentQuizQuestion;
    
    function generateQuizQuestions() {
        quizQuestions = [];
        
        // Type 1: Set the clock to a specific time
        for (let i = 0; i < 2; i++) {
            const hour = Math.floor(Math.random() * 12) + 1;
            const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const displayMinute = minute < 10 ? '0' + minute : minute;
            
            quizQuestions.push({
                type: 'setClock',
                question: `Set the clock to ${hour}:${displayMinute}`,
                answer: { hour, minute },
                options: null
            });
        }
        
        // Type 2: Read the clock and select correct time
        for (let i = 0; i < 2; i++) {
            const hour = Math.floor(Math.random() * 12) + 1;
            const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const displayMinute = minute < 10 ? '0' + minute : minute;
            const correctAnswer = `${hour}:${displayMinute}`;
            
            // Generate wrong answers
            let wrongAnswers = [];
            while (wrongAnswers.length < 3) {
                const wrongHour = Math.floor(Math.random() * 12) + 1;
                const wrongMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
                const wrongDisplayMinute = wrongMinute < 10 ? '0' + wrongMinute : wrongMinute;
                const wrongAnswer = `${wrongHour}:${wrongDisplayMinute}`;
                
                if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                    wrongAnswers.push(wrongAnswer);
                }
            }
            
            quizQuestions.push({
                type: 'readClock',
                question: 'What time does the clock show?',
                answer: correctAnswer,
                options: shuffleArray([...wrongAnswers, correctAnswer]),
                clockSettings: { hour, minute }
            });
        }
        
        // Type 3: Time difference question
        const hour = Math.floor(Math.random() * 12) + 1;
        const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const addMinutes = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
        
        let resultHour = hour;
        let resultMinute = minute + addMinutes;
        
        if (resultMinute >= 60) {
            resultHour = (resultHour + Math.floor(resultMinute / 60)) % 12 || 12;
            resultMinute = resultMinute % 60;
        }
        
        const displayMinute = minute < 10 ? '0' + minute : minute;
        const resultDisplayMinute = resultMinute < 10 ? '0' + resultMinute : resultMinute;
        const correctAnswer = `${resultHour}:${resultDisplayMinute}`;
        
        // Generate wrong answers
        let wrongAnswers = [];
        while (wrongAnswers.length < 3) {
            const wrongHour = Math.floor(Math.random() * 12) + 1;
            const wrongMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const wrongDisplayMinute = wrongMinute < 10 ? '0' + wrongMinute : wrongMinute;
            const wrongAnswer = `${wrongHour}:${wrongDisplayMinute}`;
            
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        quizQuestions.push({
            type: 'timeDifference',
            question: `If the time is ${hour}:${displayMinute}, what time will it be in ${addMinutes} minutes?`,
            answer: correctAnswer,
            options: shuffleArray([...wrongAnswers, correctAnswer]),
            clockSettings: { hour, minute }
        });
        
        // Shuffle all questions
        quizQuestions = shuffleArray(quizQuestions);
    }
    
    function loadQuizQuestion() {
        currentQuizQuestion = quizQuestions[currentQuestion - 1];
        quizQuestion.textContent = currentQuizQuestion.question;
        currentQuestionElement.textContent = currentQuestion;
        totalQuestionsElement.textContent = totalQuestions;
        
        // Reset quiz clock hands
        quizHourHand.style.transform = `translate(-50%, 0) rotate(0deg)`;
        quizMinuteHand.style.transform = `translate(-50%, 0) rotate(0deg)`;
        
        // Clear options
        quizOptions.innerHTML = '';
        
        // Clear feedback
        quizFeedback.className = 'feedback';
        quizFeedback.style.display = 'none';
        
        if (currentQuizQuestion.type === 'setClock') {
            // Users need to set the clock hands
            quizOptions.style.display = 'none';
            quizClock.style.display = 'block';
            quizHourHand.style.display = 'block';
            quizMinuteHand.style.display = 'block';
        } 
        else if (currentQuizQuestion.type === 'readClock') {
            // Set the clock hands to show a time, users select the correct time
            const hourAngle = ((currentQuizQuestion.clockSettings.hour % 12) * 30) + (currentQuizQuestion.clockSettings.minute / 2);
            const minuteAngle = currentQuizQuestion.clockSettings.minute * 6;
            
            quizHourHand.style.transform = `translate(-50%, 0) rotate(${hourAngle}deg)`;
            quizMinuteHand.style.transform = `translate(-50%, 0) rotate(${minuteAngle}deg)`;
            quizHourHand.style.display = 'block';
            quizMinuteHand.style.display = 'block';
            
            // Add multiple choice options
            quizOptions.style.display = 'flex';
            quizOptions.className = 'mc-options';
            
            currentQuizQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'mc-option';
                button.textContent = option;
                button.onclick = function() {
                    document.querySelectorAll('#quiz-options .mc-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                };
                quizOptions.appendChild(button);
            });
        } 
        else if (currentQuizQuestion.type === 'timeDifference') {
            // Show a clock and ask time difference question
            const hourAngle = ((currentQuizQuestion.clockSettings.hour % 12) * 30) + (currentQuizQuestion.clockSettings.minute / 2);
            const minuteAngle = currentQuizQuestion.clockSettings.minute * 6;
            
            quizHourHand.style.transform = `translate(-50%, 0) rotate(${hourAngle}deg)`;
            quizMinuteHand.style.transform = `translate(-50%, 0) rotate(${minuteAngle}deg)`;
            quizHourHand.style.display = 'block';
            quizMinuteHand.style.display = 'block';
            
            // Add multiple choice options
            quizOptions.style.display = 'flex';
            quizOptions.className = 'mc-options';
            
            currentQuizQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'mc-option';
                button.textContent = option;
                button.onclick = function() {
                    document.querySelectorAll('#quiz-options .mc-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                };
                quizOptions.appendChild(button);
            });
        }
    }
    
    function startQuiz() {
        currentQuestion = 1;
        score = 0;
        generateQuizQuestions();
        quizContainer.style.display = 'block';
        quizResults.style.display = 'none';
        loadQuizQuestion();
    }
    
    function checkQuizAnswer() {
        let isCorrect = false;
        
        if (currentQuizQuestion.type === 'setClock') {
            // Get current angles
            const hourTransform = quizHourHand.style.transform;
            const minuteTransform = quizMinuteHand.style.transform;
            
            const hourAngle = parseInt(hourTransform.match(/rotate\((\d+)deg\)/)[1]) || 0;
            const minuteAngle = parseInt(minuteTransform.match(/rotate\((\d+)deg\)/)[1]) || 0;
            
            // Convert angles to hours and minutes
            const hour = (hourAngle / 30) % 12 || 12; // 30 degrees per hour
            const minute = (minuteAngle / 6) % 60; // 6 degrees per minute
            
            // Check if it matches the target time
            const hourCorrect = Math.abs(hour - currentQuizQuestion.answer.hour) < 0.5 || Math.abs(hour - currentQuizQuestion.answer.hour) > 11.5;
            const minuteCorrect = Math.abs(minute - currentQuizQuestion.answer.minute) < 2.5 || Math.abs(minute - currentQuizQuestion.answer.minute) > 57.5;
            
            isCorrect = hourCorrect && minuteCorrect;
        } else {
            // For multiple choice questions
            const selectedOption = document.querySelector('#quiz-options .mc-option.selected');
            if (selectedOption) {
                isCorrect = selectedOption.textContent === currentQuizQuestion.answer;
            }
        }
        
        if (isCorrect) {
            quizFeedback.textContent = "Correct! Well done!";
            quizFeedback.className = 'feedback success';
            quizFeedback.style.display = 'block';
            score++;
            correctSound.play();
        } else {
            quizFeedback.textContent = "Not quite right!";
            quizFeedback.className = 'feedback error';
            quizFeedback.style.display = 'block';
            wrongSound.play();
        }
        
        // Move to next question after a delay
        setTimeout(() => {
            if (currentQuestion < totalQuestions) {
                currentQuestion++;
                loadQuizQuestion();
            } else {
                finishQuiz();
            }
        }, 1500);
    }
    
    function finishQuiz() {
        quizContainer.style.display = 'none';
        quizResults.style.display = 'block';
        quizScore.textContent = score;
        quizTotal.textContent = totalQuestions;
        
        // Update stars
        starsContainer.innerHTML = '';
        for (let i = 0; i < totalQuestions; i++) {
            const star = document.createElement('span');
            star.textContent = i < score ? '⭐' : '☆';
            starsContainer.appendChild(star);
        }
        
        // Update final message
        if (score === totalQuestions) {
            finalMessage.textContent = "Amazing! You're a time-telling champion!";
        } else if (score >= Math.floor(totalQuestions * 0.7)) {
            finalMessage.textContent = "Great job! You're getting really good at telling time!";
        } else if (score >= Math.floor(totalQuestions * 0.5)) {
            finalMessage.textContent = "Good effort! Keep practicing and you'll be a time expert!";
        } else {
            finalMessage.textContent = "Nice try! Let's practice more to improve your time-telling skills!";
        }
        
        completeSound.play();
    }
    
    // Initialize quiz
    startQuiz();
    
    // Add event listeners for quiz
    quizSubmit.addEventListener('click', checkQuizAnswer);
    restartQuiz.addEventListener('click', startQuiz);
});