import React, { useState, useEffect, useRef } from 'react';

const PetPersonalityAnalyzer = () => {
  const [currentStep, setCurrentStep] = useState('questionnaire');
  const [petName, setPetName] = useState('');
  const [answers, setAnswers] = useState({});
  const [characterSheet, setCharacterSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const canvasRef = useRef(null);

  const loadingMessages = [
    "Analyzing your pet's personality... 🤔",
    'Calculating combat statistics... ⚔️',
    'Generating unique abilities... ✨',
    'Crafting character sheet... 📝',
    'Adding special touches... 🎨',
    'Almost ready... 🚀',
  ];

  // Color themes based on dominant stat
  const getColorTheme = (stats) => {
    const statEntries = [
      ['wisdom', stats.wisdom],
      ['cunning', stats.cunning],
      ['agility', stats.agility],
      ['stealth', stats.stealth],
      ['charisma', stats.charisma],
      ['resolve', stats.resolve],
    ];

    const dominantStat = statEntries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];

    const themes = {
      wisdom: {
        gradient: 'from-blue-900 via-indigo-900 to-purple-900',
        accent: '#4F46E5',
        accentRgb: '79, 70, 229',
      },
      cunning: {
        gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
        accent: '#059669',
        accentRgb: '5, 150, 105',
      },
      agility: {
        gradient: 'from-red-900 via-orange-900 to-amber-900',
        accent: '#DC2626',
        accentRgb: '220, 38, 38',
      },
      charisma: {
        gradient: 'from-pink-900 via-purple-900 to-fuchsia-900',
        accent: '#EC4899',
        accentRgb: '236, 72, 153',
      },
      stealth: {
        gradient: 'from-slate-900 via-gray-900 to-zinc-900',
        accent: '#475569',
        accentRgb: '71, 85, 105',
      },
      resolve: {
        gradient: 'from-yellow-900 via-amber-900 to-orange-900',
        accent: '#F59E0B',
        accentRgb: '245, 158, 11',
      },
    };

    return themes[dominantStat];
  };

  const questions = [
    {
      id: 'meeting_people',
      question: 'When your pet meets a new person, they typically...',
      options: [
        {
          value: 'A',
          text: 'Immediately runs up with a toy or starts showing off',
          stats: { charisma: 25, boldness: 10 },
        },
        {
          value: 'B',
          text: "Approaches slowly, sniffs cautiously, then decides if they're worthy",
          stats: { wisdom: 15, cunning: 10 },
        },
        {
          value: 'C',
          text: 'Watches from a safe distance until they prove themselves',
          stats: { stealth: 20, wisdom: 15 },
        },
        {
          value: 'D',
          text: 'Hides completely until the person leaves',
          stats: { charisma: -10, stealth: 25 },
        },
      ],
    },
    {
      id: 'problem_solving',
      question: "Your pet's problem-solving approach is...",
      options: [
        {
          value: 'A',
          text: 'Find the most acrobatic route - climb, jump, or parkour their way there',
          stats: { agility: 20, boldness: 15 },
        },
        {
          value: 'B',
          text: 'Study the situation carefully, then execute a precise plan',
          stats: { wisdom: 25, cunning: 10 },
        },
        {
          value: 'C',
          text: 'Use pure persistence - stare, whine, or paw until you help',
          stats: { charisma: 20, resolve: -10 },
        },
        {
          value: 'D',
          text: "Find a sneaky workaround when no one's watching",
          stats: { cunning: 20, stealth: 15 },
        },
      ],
    },
    {
      id: 'stress_response',
      question:
        'During stressful situations (loud noises, vet visits), your pet...',
      options: [
        {
          value: 'A',
          text: 'Gets agitated and protests - this is an outrage!',
          stats: { resolve: -15, boldness: 10 },
        },
        {
          value: 'B',
          text: 'Stays calm and handles it like a pro',
          stats: { resolve: 25, wisdom: 15 },
        },
        {
          value: 'C',
          text: 'Seeks comfort but remains relatively composed',
          stats: { resolve: 10, charisma: 10 },
        },
        {
          value: 'D',
          text: "Completely shuts down or hides until it's over",
          stats: { stealth: 15, boldness: -10 },
        },
      ],
    },
    {
      id: 'favorite_spot',
      question: "Your pet's favorite hangout spot is...",
      options: [
        {
          value: 'A',
          text: 'The highest perch - on top of furniture, appliances, etc.',
          stats: { agility: 15, territory: 'Vertical' },
        },
        {
          value: 'B',
          text: 'Hidden under blankets, beds, or cozy enclosed spaces',
          stats: { stealth: 20, territory: 'Horizontal' },
        },
        {
          value: 'C',
          text: 'Right in the middle of family activity - kitchen, living room',
          stats: { charisma: 15, territory: 'Social' },
        },
        {
          value: 'D',
          text: 'A sunny window spot where they can survey everything',
          stats: { wisdom: 10, territory: 'Surveillance' },
        },
      ],
    },
    {
      id: 'activity_time',
      question: 'Your pet is most active and social during...',
      options: [
        {
          value: 'A',
          text: 'Early morning - ready to start the day!',
          stats: { energy: 'Morning' },
        },
        {
          value: 'B',
          text: 'Afternoon - peak performance time',
          stats: { energy: 'Afternoon' },
        },
        {
          value: 'C',
          text: 'Evening - suddenly becomes super affectionate or energetic',
          stats: { energy: 'Evening' },
        },
        {
          value: 'D',
          text: "They're pretty consistent throughout the day",
          stats: { energy: 'Balanced' },
        },
      ],
    },
  ];

  const openEndedQuestions = [
    {
      id: 'physical_feat',
      question:
        "What's the most impressive physical thing your pet has ever done?",
    },
    {
      id: 'attention_move',
      question:
        "Describe your pet's signature move when they want attention or treats.",
    },
    {
      id: 'weird_habit',
      question: "What's the weirdest habit or quirk your pet has?",
    },
    {
      id: 'intelligence',
      question:
        'Tell us about a time your pet surprised you with their intelligence or problem-solving.',
    },
    {
      id: 'superpower',
      question:
        'If your pet were a superhero, what would their special power be?',
    },
  ];

  const calculateStats = () => {
    const baseStats = {
      wisdom: 50,
      cunning: 50,
      agility: 50,
      stealth: 50,
      charisma: 50,
      resolve: 50,
      boldness: 50,
    };

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const selectedOption = question.options.find(
          (opt) => opt.value === answer
        );
        if (selectedOption?.stats) {
          Object.entries(selectedOption.stats).forEach(([stat, value]) => {
            if (typeof value === 'number' && baseStats.hasOwnProperty(stat)) {
              baseStats[stat] = Math.max(
                0,
                Math.min(100, baseStats[stat] + value)
              );
            }
          });
        }
      }
    });

    return baseStats;
  };

  const generateDebugCharacterSheet = () => {
    const debugStats = {
      wisdom: 90,
      cunning: 60,
      agility: 65,
      stealth: 95,
      charisma: 60,
      resolve: 90,
      boldness: 75,
    };

    const debugCharacterData = {
      archetype: 'The Contemplative Defender',
      combatMoves: [
        {
          name: 'Tail Inflation',
          stats: 'Intimidation • 85% Success • 3s Windup',
          description:
            'Signature defensive move that inflates tail to maximum size',
        },
        {
          name: 'Growl Warning',
          stats: 'Area Effect • 70% Success • Instant',
          description:
            'Low-frequency threat display that affects all nearby targets',
        },
      ],
      environmentalPowers: [
        {
          name: 'Blanket Fort Mastery',
          stats: 'Territory Control • Horizontal Spaces • Permanent',
          description:
            'Complete dominance of under-cover zones and bedding areas',
        },
        {
          name: 'Silent Stealth Protocol',
          stats: 'Invisibility • No Coverage Required • Passive',
          description:
            'Predators cannot detect waste regardless of concealment effort',
        },
      ],
      socialSkills: [
        {
          name: 'Gradual Bond Formation',
          stats: 'Trust Building • High Loyalty • Slow Activation',
          description:
            'Takes time to warm up but forms deep, lasting connections',
        },
        {
          name: 'Guardian Protocol',
          stats: 'Ally Protection • Auto-Trigger • High Priority',
          description:
            'Automatically intervenes to rescue or defend allies when needed',
        },
      ],
      passiveTraits: [
        {
          name: 'Contemplative Focus',
          stats: 'Mental Clarity • Constant • Stress Resistance',
          description:
            'Maintains calm and clear thinking in stressful situations like vet visits',
        },
        {
          name: 'Muppet Face Advantage',
          stats: 'Charm Bonus • Visual Effect • Always Active',
          description:
            'Natural endearing appearance provides social advantages',
        },
      ],
      weakness: {
        name: 'AC Startle Response',
        description:
          'Sudden air conditioning activation causes -30 to all stats for 10 seconds',
      },
      timeModifiers: [
        {
          name: 'Morning Wisdom Boost',
          effect: 'Stealth +5, Wisdom +10 during morning hours',
        },
        {
          name: 'Evening Guardian Mode',
          effect: 'Charisma +10, Guardian Protocol Range +50%',
        },
      ],
    };

    const debugCharacterSheet = {
      characterData: debugCharacterData,
      stats: debugStats,
      petName: 'Sente',
    };

    setCharacterSheet(debugCharacterSheet);
    setCurrentStep('result');
  };

  const generatePDF = async () => {
    const { characterData, stats, petName: name } = characterSheet;

    // Create a simple text-based PDF (since we can't import jsPDF in artifacts)
    // We'll create a formatted text document that looks like a character sheet

    const pdfContent = `
╔═══════════════════════════════════════════════════════════════╗
║                           CATSTATS                            ║
║                    FELINE LEGEND CHARACTER SHEET             ║
╠═══════════════════════════════════════════════════════════════╣

🐱 NAME: ${name.toUpperCase()}
🏆 ARCHETYPE: ${characterData.archetype}

╔═══════════════════════════════════════════════════════════════╗
║                        CORE ATTRIBUTES                       ║
╠═══════════════════════════════════════════════════════════════╣
║ Wisdom...................................... ${stats.wisdom.toString().padStart(3)} ║
║ Cunning..................................... ${stats.cunning.toString().padStart(3)} ║
║ Agility..................................... ${stats.agility.toString().padStart(3)} ║
║ Stealth..................................... ${stats.stealth.toString().padStart(3)} ║
║ Charisma.................................... ${stats.charisma.toString().padStart(3)} ║
║ Resolve..................................... ${stats.resolve.toString().padStart(3)} ║
╚═══════════════════════════════════════════════════════════════╝

⚔️  COMBAT MOVES:
${characterData.combatMoves
  .map(
    (ability) =>
      `• ${ability.name}\n  ${ability.stats}\n  ${ability.description}\n`
  )
  .join('')}

🌍 ENVIRONMENTAL POWERS:
${characterData.environmentalPowers
  .map(
    (ability) =>
      `• ${ability.name}\n  ${ability.stats}\n  ${ability.description}\n`
  )
  .join('')}

💬 SOCIAL SKILLS:
${characterData.socialSkills
  .map(
    (ability) =>
      `• ${ability.name}\n  ${ability.stats}\n  ${ability.description}\n`
  )
  .join('')}

🔮 PASSIVE TRAITS:
${characterData.passiveTraits
  .map(
    (ability) =>
      `• ${ability.name}\n  ${ability.stats}\n  ${ability.description}\n`
  )
  .join('')}

⚠️  CRITICAL VULNERABILITY:
• ${characterData.weakness.name}
  ${characterData.weakness.description}

🕒 SITUATIONAL MODIFIERS:
${characterData.timeModifiers
  .map((modifier) => `• ${modifier.name}: ${modifier.effect}\n`)
  .join('')}

╔═══════════════════════════════════════════════════════════════╗
║                    Generated by CatStats                     ║
║                  Turn your cat into a legend!                ║
╚═══════════════════════════════════════════════════════════════╝
`;

    // Create and download as a text file (since PDF generation requires external libraries)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}-CatStats-Legend.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(
      `✨ ${name}'s character sheet downloaded! Perfect for printing or sharing.`
    );
  };

  const generateCharacterSheet = async () => {
    setLoading(true);
    setLoadingMessage(loadingMessages[0]);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 5000); // Change message every 5 seconds

    const stats = calculateStats();

    const behavioralInputs = openEndedQuestions
      .map((q) => {
        return `${q.question}: "${answers[q.id] || 'Not specified'}"`;
      })
      .join('\n');

    const stressWeakness = answers.stress_weakness || 'Not specified';

    const prompt = `Generate ONLY the creative content for a pet character sheet. Return your response as valid JSON in this exact format:

{
  "archetype": "The [Creative Archetype Name]",
  "combatMoves": [
    {
      "name": "Ability Name",
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    },
    {
      "name": "Second Ability Name", 
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    }
  ],
  "environmentalPowers": [
    {
      "name": "Power Name",
      "stats": "Type • Effect • Duration", 
      "description": "Description"
    },
    {
      "name": "Second Power Name",
      "stats": "Type • Effect • Duration",
      "description": "Description"
    }
  ],
  "socialSkills": [
    {
      "name": "Skill Name",
      "stats": "Type • Success Rate • Effect",
      "description": "Description"
    },
    {
      "name": "Second Skill Name",
      "stats": "Type • Success Rate • Effect", 
      "description": "Description"
    }
  ],
  "passiveTraits": [
    {
      "name": "Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    },
    {
      "name": "Second Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    }
  ],
  "weakness": {
    "name": "Weakness Name",
    "description": "Description of the major weakness with game mechanics"
  },
  "timeModifiers": [
    {
      "name": "Time Period or Situation",
      "effect": "Stat changes and effects"
    }
  ]
}

Pet Details:
- Name: ${petName}

Behavioral Input:
${behavioralInputs}
Biggest fear/weakness: "${stressWeakness}"

Create videogame-style abilities based on the pet's behaviors. Make ability names creative and memorable. Include game mechanics in the stats line. Return ONLY valid JSON with no other text.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      let jsonContent = data.content[0].text;

      jsonContent = jsonContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const characterData = JSON.parse(jsonContent);

      const characterSheetData = {
        characterData,
        stats,
        petName,
      };

      setCharacterSheet(characterSheetData);
      setCurrentStep('result');
      clearInterval(messageInterval);
    } catch (error) {
      console.error('Error generating character sheet:', error);
      alert(
        "Sorry, there was an error generating your pet's character sheet. Please try again."
      );
      clearInterval(messageInterval);
    } finally {
      setLoading(false);
      setLoadingMessage('');
      clearInterval(messageInterval);
    }
  };

  const drawRadarChart = (canvas, stats, theme) => {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;

    const statLabels = [
      'Wisdom',
      'Cunning',
      'Agility',
      'Stealth',
      'Charisma',
      'Resolve',
    ];
    const statValues = [
      stats.wisdom,
      stats.cunning,
      stats.agility,
      stats.stealth,
      stats.charisma,
      stats.resolve,
    ];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 1; i <= 5; i++) {
      const scaleRadius = (radius * i) / 5;
      ctx.fillText((i * 20).toString(), centerX + scaleRadius + 5, centerY + 3);
    }

    for (let i = 0; i < statLabels.length; i++) {
      const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const labelX = centerX + Math.cos(angle) * (radius + 25);
      const labelY = centerY + Math.sin(angle) * (radius + 25) + 4;
      ctx.fillText(`${statLabels[i]} (${statValues[i]})`, labelX, labelY);
    }

    ctx.beginPath();
    for (let i = 0; i < statValues.length; i++) {
      const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
      const value = statValues[i] / 100;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    ctx.fillStyle = `rgba(${theme.accentRgb}, 0.3)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    for (let i = 0; i < statValues.length; i++) {
      const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
      const value = statValues[i] / 100;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  useEffect(() => {
    if (currentStep === 'result' && characterSheet && canvasRef.current) {
      const theme = getColorTheme(characterSheet.stats);
      drawRadarChart(canvasRef.current, characterSheet.stats, theme);
    }
  }, [currentStep, characterSheet]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const requiredMCQuestions = questions.every((q) => answers[q.id]);
    const requiredOpenEnded = openEndedQuestions.every((q) =>
      answers[q.id]?.trim()
    );
    const hasWeakness = answers.stress_weakness?.trim();

    if (!petName.trim()) {
      alert("Please fill in your pet's name.");
      return;
    }

    if (!requiredMCQuestions) {
      alert('Please answer all multiple choice questions.');
      return;
    }

    if (!requiredOpenEnded || !hasWeakness) {
      alert('Please answer all open-ended questions.');
      return;
    }

    generateCharacterSheet();
  };

  const resetForm = () => {
    setCurrentStep('questionnaire');
    setPetName('');
    setAnswers({});
    setCharacterSheet(null);
  };

  if (currentStep === 'result' && characterSheet) {
    const { characterData, stats, petName: name } = characterSheet;
    const theme = getColorTheme(stats);

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4`}>
        <div className="max-w-4xl mx-auto mb-6 flex gap-4">
          <button
            onClick={resetForm}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-6 py-2 text-white hover:bg-white/30 transition-colors"
          >
            ← Create Another Legend
          </button>
          <button
            onClick={generatePDF}
            className="bg-gradient-to-r from-purple-500 to-blue-500 backdrop-blur-md border border-white/30 rounded-lg px-6 py-2 text-white hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center gap-2"
          >
            📄 Download Character Sheet
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {name.toUpperCase()}
            </h1>
            <p className="text-white/80 text-xl">{characterData.archetype}</p>
          </div>

          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
              <h3 className="text-white font-bold text-xl mb-4 text-center">
                Core Attributes
              </h3>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={350}
                  height={350}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Combat Moves
              </h3>
              {characterData.combatMoves.map((ability, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-red-300 font-bold">{ability.name}</div>
                  <div className="text-white/60 text-sm italic">
                    {ability.stats}
                  </div>
                  <div className="text-white/80 text-sm">
                    {ability.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Environmental Powers
              </h3>
              {characterData.environmentalPowers.map((ability, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-cyan-300 font-bold">{ability.name}</div>
                  <div className="text-white/60 text-sm italic">
                    {ability.stats}
                  </div>
                  <div className="text-white/80 text-sm">
                    {ability.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Social Skills
              </h3>
              {characterData.socialSkills.map((ability, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-yellow-300 font-bold">
                    {ability.name}
                  </div>
                  <div className="text-white/60 text-sm italic">
                    {ability.stats}
                  </div>
                  <div className="text-white/80 text-sm">
                    {ability.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Passive Traits
              </h3>
              {characterData.passiveTraits.map((ability, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-purple-300 font-bold">
                    {ability.name}
                  </div>
                  <div className="text-white/60 text-sm italic">
                    {ability.stats}
                  </div>
                  <div className="text-white/80 text-sm">
                    {ability.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-red-300 font-bold text-lg mb-2">
              ⚠️ Critical Vulnerability
            </h3>
            <div className="text-white">
              <span className="font-bold">{characterData.weakness.name}:</span>{' '}
              {characterData.weakness.description}
            </div>
          </div>

          {characterData.timeModifiers &&
            characterData.timeModifiers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">
                  Situational Modifiers
                </h3>
                {characterData.timeModifiers.map((modifier, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                    <div className="text-green-300 font-bold">
                      {modifier.name}
                    </div>
                    <div className="text-white/80 text-sm">
                      {modifier.effect}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
            <h3 className="text-white font-bold text-lg mb-2">
              Creating Your Cat's Legend
            </h3>
            <p className="text-white/80 text-sm mb-4">{loadingMessage}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse"
                style={{ width: '60%' }}
              ></div>
            </div>
            <p className="text-white/60 text-xs mt-4">
              This usually takes 20-30 seconds
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl relative">
          <button
            onClick={generateDebugCharacterSheet}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-3 py-1 text-white/70 text-xs hover:bg-white/20 transition-colors"
          >
            Debug Mode
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">CatStats</h1>
            <p className="text-white/80">Turn your cat into a legend!</p>
          </div>

          <div className="space-y-6">
            <div className="mb-8">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors"
                  placeholder="e.g., Fluffy"
                />
              </div>
            </div>

            {questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-3">
                <h3 className="text-white font-semibold text-lg">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        answers[question.id] === option.value
                          ? 'bg-blue-500/30 border border-blue-400'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() =>
                        handleAnswerChange(question.id, option.value)
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          answers[question.id] === option.value
                            ? 'border-blue-400 bg-blue-400'
                            : 'border-white/50'
                        }`}
                      >
                        {answers[question.id] === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-white/90 text-sm">
                        {option.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-3">
              <h3 className="text-white font-semibold text-lg">
                What's your pet's biggest fear or weakness?
              </h3>
              <textarea
                value={answers.stress_weakness || ''}
                onChange={(e) =>
                  handleAnswerChange('stress_weakness', e.target.value)
                }
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors h-16"
                placeholder="e.g., Thunder storms, vacuum cleaner, doorbell..."
              />
            </div>

            {openEndedQuestions.map((question, qIndex) => (
              <div key={question.id} className="space-y-3">
                <h3 className="text-white font-semibold text-lg">
                  {qIndex + 6}. {question.question}
                </h3>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors h-20"
                  placeholder="Share your pet's story..."
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading || !petName}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Your Legend...' : 'Create Cat Legend'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetPersonalityAnalyzer;
