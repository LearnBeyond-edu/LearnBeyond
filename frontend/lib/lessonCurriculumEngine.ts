/**
 * Lesson Curriculum Engine
 * 
 * Provides dynamic, topic-specific curriculum data for:
 * 1. Tactile Physics Sandbox (3 physical concept nodes, connective energy flow, "how it works" principles)
 * 2. Kinesthetic AR Multi-Sensory Arena (3 topic-specific manipulable components, targets, instructions, and educational takeaways)
 * 
 * Covers universal academic disciplines and includes an algorithmic NLP extractor
 * for ANY custom lesson topic generated across the universe.
 */

export interface TactileStepConfig {
  id: string;
  stepNumber: number;
  name: string;
  role: string;
  symbol?: string;
  desc: string;
  howItWorks: string;
  icon: string;
  color: 'amber' | 'blue' | 'teal' | 'red' | 'purple' | 'emerald' | 'indigo' | 'orange';
  fact: string;
}

export interface TactileLabConfig {
  conceptType: 'thermodynamics' | 'physics' | 'biology' | 'chemistry' | 'space' | 'general';
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  steps: TactileStepConfig[];
  flow1to2: string; // "How Node 1 transfers energy/signal to Node 2"
  flow2to3: string; // "How Node 2 connects to Node 3"
  systemPrinciple: string; // "Overall working law or formula"
  pulseLabel: string;
  successTitle: string;
  successSummary: string;
}

export interface KinestheticItemConfig {
  id: string;
  label: string;
  color: 'red' | 'blue' | 'amber' | 'emerald' | 'purple' | 'slate' | 'teal' | string;
  symbol?: string;
  role?: string;
  desc?: string;
}

export interface KinestheticThemeConfig {
  title: string;
  items: KinestheticItemConfig[];
  success: string;
  educationalTakeaway: string;
  layout: 'linear' | 'orbit' | 'cell';
  bgClass: string;
  instructions: string[];
}

export interface LessonCurriculumModels {
  tactile: TactileLabConfig;
  kinesthetic: KinestheticThemeConfig;
}

/**
 * Universal Knowledge Base of Academic Disciplines
 */
interface DomainModel {
  keywords: string[];
  tactile: TactileLabConfig;
  kinesthetic: KinestheticThemeConfig;
}

const DOMAIN_KNOWLEDGE_BASE: DomainModel[] = [
  // 1. Thermodynamics & Heat Engines
  {
    keywords: ["thermodynam", "carnot", "heat engine", "entropy", "thermal", "stirling", "conduction", "first law", "second law", "refrigeration"],
    tactile: {
      conceptType: "thermodynamics",
      title: "Hands-On Thermodynamics & Heat Engine Lab",
      subtitle: "Connect the thermal source, expansion medium, and cold sink to generate mechanical work!",
      badge: "Thermodynamics & Energy",
      accentColor: "red",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Heat Source (Q_h)",
          role: "High-Temp Thermal Influx",
          symbol: "Q_h",
          desc: "Supplies high-temperature thermal energy (Q_in) from fuel combustion or solar radiation.",
          howItWorks: "Thermal energy excites gas molecules, rapidly multiplying kinetic velocity and internal pressure.",
          icon: "Flame",
          color: "red",
          fact: "First Law: Energy is conserved—thermal input equals mechanical work plus heat exhaust (Q_h = W + Q_c)!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Expansion Piston",
          role: "Mechanical Work Medium",
          symbol: "W",
          desc: "Translates expanding gas pressure into linear mechanical displacement.",
          howItWorks: "Pressurized gas expands against the piston face, driving kinetic work W = P · ΔV.",
          icon: "Zap",
          color: "amber",
          fact: "Second Law: Heat cannot spontaneously flow from a colder body to a hotter body without external work!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Heat Sink (Q_c)",
          role: "Cold Reservoir & Exhaust",
          symbol: "Q_c",
          desc: "Vents residual entropy (Q_out) to sustain the cyclic temperature differential.",
          howItWorks: "Absorbs residual heat to reset working gas volume and pressure for the next cycle.",
          icon: "Droplets",
          color: "teal",
          fact: "Carnot Efficiency Limit: No heat engine can exceed η = 1 - (T_c / T_h)!"
        }
      ],
      flow1to2: "🔥 Heat Transfer (Q_h) ➔ Drives Gas Expansion Pressure",
      flow2to3: "⚙️ Piston Work (W) ➔ Residual Heat Vented to Sink (Q_c)",
      systemPrinciple: "Thermodynamic Heat Engine Cycle: Q_in ➔ Expansion Work (W) ➔ Cold Exhaust (Q_c) | First Law: ΔU = Q - W",
      pulseLabel: "Simulate Thermal Influx Surge",
      successTitle: "Thermodynamic Heat Cycle Operating at Optimal Efficiency!",
      successSummary: "High-temperature heat (Q_h) expands the working medium to produce mechanical work (W), discharging residual entropy to the cold sink (Q_c) in strict compliance with the laws of thermodynamics!"
    },
    kinesthetic: {
      title: "Assemble the Thermodynamic Engine",
      items: [
        { id: "heat_source", label: "HEAT SOURCE", color: "red", desc: "High-temperature energy supply" },
        { id: "expansion_piston", label: "EXPANSION PISTON", color: "amber", desc: "Thermal-to-mechanical transducer" },
        { id: "heat_sink", label: "HEAT SINK", color: "blue", desc: "Cold reservoir entropy exhaust" }
      ],
      success: "THERMODYNAMIC ENGINE ASSEMBLED: WORK PRODUCED!",
      educationalTakeaway: "You merged all 3 components! The high-temperature heat source drives gas expansion to produce mechanical work, while the cold sink preserves the essential temperature gradient for continuous cyclic operation.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-red-950/30 to-black",
      instructions: [
        "1. Position HEAT SOURCE into Target 1 to initiate thermal energy influx.",
        "2. Align EXPANSION PISTON into Target 2 to convert expanding gas into mechanical work.",
        "3. Connect HEAT SINK into Target 3 to exhaust entropy and complete the thermodynamic cycle."
      ]
    }
  },

  // 2. Photosynthesis & Plant Biology
  {
    keywords: ["photosynth", "chloroplast", "chlorophyll", "calvin cycle", "light reaction", "leaf", "thylakoid", "autotroph"],
    tactile: {
      conceptType: "biology",
      title: "Hands-On Photosynthesis Biosynthesis Lab",
      subtitle: "Connect sunlight photons, chloroplast thylakoid, and Calvin cycle to synthesize glucose!",
      badge: "Plant Biology & Energy",
      accentColor: "emerald",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Solar Photons & H2O",
          role: "Light & Water Influx",
          symbol: "hν+H2O",
          desc: "Sunlight photons excite chlorophyll pigments while roots supply water (H2O).",
          howItWorks: "Photolysis splits water molecules into protons, electrons, and oxygen gas (O2).",
          icon: "Sun",
          color: "amber",
          fact: "Chlorophyll absorbs red and blue wavelengths while reflecting green light!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Chloroplast Thylakoid",
          role: "Electron Transport & ATP",
          symbol: "ETC",
          desc: "Excited electrons move along the thylakoid membrane generating ATP and NADPH.",
          howItWorks: "Light reactions store chemical energy in high-energy ATP and NADPH carrier molecules.",
          icon: "Zap",
          color: "teal",
          fact: "Thylakoid stacks called grana maximize surface area for light absorption!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Calvin Cycle & Glucose",
          role: "Sugar Synthesis (C6H12O6)",
          symbol: "C6H12O6",
          desc: "Fixes atmospheric carbon dioxide (CO2) into stable, energy-rich glucose sugar.",
          howItWorks: "Enzyme RuBisCO incorporates CO2 into organic molecules using stored ATP energy.",
          icon: "Sparkles",
          color: "emerald",
          fact: "Photosynthesis chemical equation: 6CO2 + 6H2O + Light ➔ C6H12O6 + 6O2!"
        }
      ],
      flow1to2: "☀️ Photolysis ➔ Electron Transport & ATP Generation",
      flow2to3: "⚡ ATP Energy Carriers ➔ Carbon Fixation & Glucose Synthesis",
      systemPrinciple: "Photosynthesis Biosphere Cycle: Light + 6H2O + 6CO2 ➔ Glucose (C6H12O6) + 6O2",
      pulseLabel: "Simulate Solar Photon Burst",
      successTitle: "Photosynthetic Biosynthesis Active & Producing Glucose!",
      successSummary: "Photons and water split in the thylakoid to create ATP and NADPH, driving the Calvin cycle to convert atmospheric CO2 into life-sustaining glucose!"
    },
    kinesthetic: {
      title: "Synthesize Photosynthesis",
      items: [
        { id: "light_water", label: "LIGHT & H2O", color: "amber", desc: "Photons and water molecules" },
        { id: "chloroplast", label: "CHLOROPLAST", color: "teal", desc: "Thylakoid light harvesting complex" },
        { id: "glucose_o2", label: "GLUCOSE & O2", color: "emerald", desc: "Chemical energy sugar product" }
      ],
      success: "PHOTOSYNTHETIC BIOSYNTHESIS ACHIEVED!",
      educationalTakeaway: "You merged the light-harvesting elements with the chloroplast machinery to fix carbon dioxide into chemical energy (glucose) while releasing oxygen into the atmosphere!",
      layout: "cell",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-teal-950/30 to-black",
      instructions: [
        "1. Feed LIGHT & H2O into Target 1 to begin water photolysis.",
        "2. Activate the CHLOROPLAST in Target 2 to generate ATP & NADPH energy carriers.",
        "3. Complete the Calvin Cycle in Target 3 to synthesize GLUCOSE and release Oxygen."
      ]
    }
  },

  // 3. Solar System & Gravitational Orbits
  {
    keywords: ["solar", "planet", "space", "orbit", "gravity", "astronomy", "star", "sun", "moon", "earth", "kepler"],
    tactile: {
      conceptType: "space",
      title: "Hands-On Solar System & Orbital Mechanics Lab",
      subtitle: "Place the gravitational center, habitable planet, and tidal satellite to establish stable orbits!",
      badge: "Astronomy & Gravitation",
      accentColor: "amber",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Ignite the Sun",
          role: "Center Star & Gravity Well",
          symbol: "M_☉",
          desc: "The massive gravitational anchor curving spacetime to hold planets in stable orbit.",
          howItWorks: "Gravitational attraction F = G·(M·m)/r² balances planetary centripetal inertia.",
          icon: "Sun",
          color: "amber",
          fact: "The Sun contains 99.8% of all mass in our entire solar system!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Launch Planet Earth",
          role: "Habitable Goldilocks Zone",
          symbol: "1 AU",
          desc: "The middle orbit where liquid water, magnetic protection, and atmosphere thrive.",
          howItWorks: "Orbital velocity v = √(G·M/r) creates a continuous freefall trajectory around the Sun.",
          icon: "Globe",
          color: "blue",
          fact: "Earth travels at approximately 30 kilometers per second around the Sun!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Tether the Moon",
          role: "Natural Satellite & Tides",
          symbol: "Tides",
          desc: "The orbital partner that stabilizes Earth's axial tilt and drives ocean tides.",
          howItWorks: "Differential gravitational pull stretches Earth's oceans into rhythmic tidal bulges.",
          icon: "Moon",
          color: "teal",
          fact: "The Moon's gravitational stabilization keeps Earth's seasons remarkably predictable!"
        }
      ],
      flow1to2: "☀️ Spacetime Curvature ➔ Balances Earth Orbital Velocity",
      flow2to3: "🌍 Earth Gravity Well ➔ Tethers Lunar Orbit & Regulates Tides",
      systemPrinciple: "Keplerian Gravitational Equilibrium: F_grav = F_centripetal = m·v²/r",
      pulseLabel: "Simulate Solar Gravitational Flare",
      successTitle: "Solar System Active & In Perfect Orbital Harmony!",
      successSummary: "Spacetime curvature from the Sun balances Earth's tangential velocity, while the Moon's orbital resonance stabilizes oceanic tides and axial tilt!"
    },
    kinesthetic: {
      title: "Assemble the Solar System",
      items: [
        { id: "sun", label: "SOLAR CORE", color: "amber", desc: "Central gravitational mass" },
        { id: "earth", label: "PLANET EARTH", color: "blue", desc: "Habitable zone planetary body" },
        { id: "moon", label: "LUNAR MOON", color: "slate", desc: "Tidal satellite partner" }
      ],
      success: "SOLAR ORBITAL SYSTEM BALANCED!",
      educationalTakeaway: "You balanced the centripetal forces of planetary motion against solar gravitational attraction, stabilizing the orbit of Earth and Moon!",
      layout: "orbit",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-purple-950/30 to-black",
      instructions: [
        "1. Ignite the SOLAR CORE at the center to create the primary gravitational well.",
        "2. Place PLANET EARTH into the middle orbit to establish the habitable zone.",
        "3. Tether the LUNAR MOON on the outer orbital track to stabilize tidal equilibrium."
      ]
    }
  },

  // 4. Cellular Biology & Organelles
  {
    keywords: ["cell", "biol", "nucleus", "organelle", "membrane", "ribosome", "cytoplasm", "dna", "gene"],
    tactile: {
      conceptType: "biology",
      title: "Hands-On Living Cell Architecture Lab",
      subtitle: "Place the protective membrane, mitochondrial powerhouse, and DNA control center!",
      badge: "Cellular Biology",
      accentColor: "emerald",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Cell Membrane Barrier",
          role: "Selective Phospholipid Shield",
          symbol: "Lipid",
          desc: "A semi-permeable bilayer that regulates molecular transport and homeostasis.",
          howItWorks: "Hydrophobic lipid tails repel water while protein channels selectively admit nutrients.",
          icon: "Shield",
          color: "teal",
          fact: "The cell membrane maintains the precise electrochemical gradient essential for life!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Mitochondria Powerhouse",
          role: "ATP Chemical Synthesis",
          symbol: "ATP",
          desc: "Converts glucose and oxygen into high-energy ATP molecules.",
          howItWorks: "Oxidative phosphorylation across cristae folds pumps protons to drive ATP synthase.",
          icon: "Zap",
          color: "amber",
          fact: "Mitochondria possess their own distinct circular DNA inherited maternally!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "DNA Master Nucleus",
          role: "Genetic Information Core",
          symbol: "DNA",
          desc: "Houses the genetic blueprint and directs RNA transcription for cellular proteins.",
          howItWorks: "Genes transcribe into messenger RNA to instruct ribosomes in protein construction.",
          icon: "Atom",
          color: "purple",
          fact: "The human cell nucleus contains approximately 2 meters of coiled DNA!"
        }
      ],
      flow1to2: "🛡️ Nutrient Influx ➔ Fuels Mitochondrial ATP Synthesis",
      flow2to3: "⚡ ATP Chemical Energy ➔ Powers DNA Transcription & Repair",
      systemPrinciple: "Cellular Metabolic Harmony: Nutrients + O2 ➔ ATP Energy ➔ Gene Expression & Maintenance",
      pulseLabel: "Simulate ATP Cellular Energy Surge",
      successTitle: "Cell Alive, Synthesized & Fully Operational!",
      successSummary: "The protective membrane regulates nutrient intake, mitochondria supply ATP energy, and the nucleus orchestrates protein synthesis for cellular survival!"
    },
    kinesthetic: {
      title: "Build the Living Cell",
      items: [
        { id: "membrane", label: "MEMBRANE", color: "teal", desc: "Protective lipid bilayer" },
        { id: "mitochondria", label: "MITOCHONDRIA", color: "amber", desc: "ATP power plant" },
        { id: "nucleus", label: "NUCLEUS", color: "purple", desc: "Genetic control center" }
      ],
      success: "CELLULAR ARCHITECTURE SYNTHESIZED!",
      educationalTakeaway: "You assembled the fundamental unit of life! The membrane shields internal processes, mitochondria provide the biochemical fuel, and the nucleus coordinates cellular function.",
      layout: "cell",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/40 via-emerald-950/30 to-black",
      instructions: [
        "1. Construct the MEMBRANE boundary to shield the internal cytoplasm.",
        "2. Place the MITOCHONDRIA to generate chemical ATP energy.",
        "3. Position the NUCLEUS in the center to govern genetic transcription."
      ]
    }
  },

  // 5. Newton's Laws & Classical Mechanics
  {
    keywords: ["newton", "force", "motion", "inertia", "momentum", "mechanic", "acceleration", "friction", "velocity"],
    tactile: {
      conceptType: "physics",
      title: "Hands-On Newton's Laws of Motion Lab",
      subtitle: "Apply net force to an inertial mass to observe proportional acceleration!",
      badge: "Classical Mechanics",
      accentColor: "indigo",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Net Applied Force (F)",
          role: "Vector Force Influx",
          symbol: "F_net",
          desc: "External directional push or pull applied to overcome static inertia.",
          howItWorks: "Unbalanced forces disrupt equilibrium according to Newton's First Law.",
          icon: "Flame",
          color: "red",
          fact: "Newton's First Law: An object at rest remains at rest unless acted on by a net external force!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Inertial Mass (m)",
          role: "Resistance to Acceleration",
          symbol: "Mass",
          desc: "The physical quantity of matter resisting changes in its state of motion.",
          howItWorks: "Greater mass demands proportionally greater force to achieve equivalent acceleration.",
          icon: "Zap",
          color: "amber",
          fact: "Mass is an intrinsic property that remains constant regardless of local gravity!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Resultant Acceleration (a)",
          role: "Kinematic Rate of Change",
          symbol: "a = F/m",
          desc: "The time rate of change of velocity directly proportional to force and inverse to mass.",
          howItWorks: "Linear acceleration a = F/m propels the mass forward along the force vector.",
          icon: "Sparkles",
          color: "emerald",
          fact: "Newton's Second Law: F = m · a is the foundation of all classical mechanics!"
        }
      ],
      flow1to2: "💥 Vector Force (F) ➔ Overcomes Inertial Resistance of Mass (m)",
      flow2to3: "⚖️ Mass Displacement ➔ Generates Proportional Acceleration (a)",
      systemPrinciple: "Newton's Fundamental Law of Motion: a = F_net / m | Action = -Reaction",
      pulseLabel: "Apply High-Impact Kinetic Pulse",
      successTitle: "Kinetic Mechanics System Synchronized!",
      successSummary: "Applied force overcomes inertial mass to produce linear acceleration exactly obeying Newton's Second Law of Motion: F = m · a!"
    },
    kinesthetic: {
      title: "Simulate Newton's Law of Motion",
      items: [
        { id: "force", label: "APPLIED FORCE", color: "red", desc: "Net vector force" },
        { id: "mass", label: "INERTIAL MASS", color: "amber", desc: "Physical mass resistance" },
        { id: "acceleration", label: "ACCELERATION", color: "emerald", desc: "Velocity rate of change" }
      ],
      success: "NEWTONIAN MOTION BALANCED: F = m·a!",
      educationalTakeaway: "You demonstrated Newton's Second Law! Applying force to mass produces acceleration directly proportional to the force and inversely proportional to the mass.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-blue-950/30 to-black",
      instructions: [
        "1. Position APPLIED FORCE into Target 1 to initiate the kinetic impulse.",
        "2. Align INERTIAL MASS into Target 2 to establish resistance to motion.",
        "3. Complete the circuit with ACCELERATION in Target 3 to verify F = m · a."
      ]
    }
  },

  // 6. Electric Circuits & Electromagnetism
  {
    keywords: ["electric", "circuit", "voltage", "current", "resistor", "ohm", "conduct", "wire", "electromagnet"],
    tactile: {
      conceptType: "physics",
      title: "Hands-On Electric Circuit & Current Lab",
      subtitle: "Connect the voltage potential, current conductor, and kinetic load to complete the circuit!",
      badge: "Electricity & Magnetism",
      accentColor: "indigo",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "12V Voltage Source",
          role: "Electrical Potential Pressure",
          symbol: "V = 12V",
          desc: "Creates chemical potential difference to drive electron flow through the circuit.",
          howItWorks: "Electrochemical reaction separates charges, producing voltage electromotive force.",
          icon: "Battery",
          color: "red",
          fact: "Voltage measures the electrical potential energy difference per unit charge (Joules/Coulomb)!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Conductive Circuit Switch",
          role: "Electron Flow Pathway",
          symbol: "Closed Loop",
          desc: "Provides continuous metallic lattice pathway with low electrical impedance.",
          howItWorks: "Closing the switch establishes an unbroken electromagnetic field for drift velocity.",
          icon: "Zap",
          color: "amber",
          fact: "Electricity flows through conductors at nearly the speed of light via electromagnetic wave propagation!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Kinetic Motor / Load",
          role: "Energy Transducer & Work",
          symbol: "Load (R)",
          desc: "Converts electrical current into rotational mechanical energy and light.",
          howItWorks: "Magnetic fields generated by current coils interact with permanent magnets to spin the rotor.",
          icon: "Lightbulb",
          color: "emerald",
          fact: "Ohm's Law: Current I = V / R defines the flow through any electrical resistance!"
        }
      ],
      flow1to2: "⚡ Voltage Potential (V) ➔ Propels Electron Current Drift",
      flow2to3: "🔌 Continuous Flow (I) ➔ Powers Kinetic Motor Transformation",
      systemPrinciple: "Closed Electrical Circuit: V = I · R | Power P = V · I",
      pulseLabel: "Send High-Voltage Current Surge",
      successTitle: "Circuit Complete & Current Flowing!",
      successSummary: "Electrical potential from the battery drives continuous current across the conductor, energizing the motor to convert electricity into kinetic work!"
    },
    kinesthetic: {
      title: "Complete the Electrical Circuit",
      items: [
        { id: "battery", label: "VOLTAGE SOURCE", color: "red", desc: "Electromotive potential" },
        { id: "switch", label: "CIRCUIT SWITCH", color: "amber", desc: "Conductive closed loop" },
        { id: "motor", label: "KINETIC MOTOR", color: "blue", desc: "Electromagnetic load" }
      ],
      success: "CIRCUIT OPERATIONAL: CURRENT FLOWING!",
      educationalTakeaway: "You completed the electrical circuit! Voltage pressure pushes electrons through the closed pathway to power the kinetic motor, satisfying Ohm's Law.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-cyan-950/30 to-black",
      instructions: [
        "1. Place VOLTAGE SOURCE into Target 1 to establish electromotive pressure.",
        "2. Connect the CIRCUIT SWITCH in Target 2 to close the conductive loop.",
        "3. Power the KINETIC MOTOR in Target 3 to transform electricity into mechanical motion."
      ]
    }
  },

  // 7. Waves, Optics & Light
  {
    keywords: ["wave", "sound", "light", "optics", "frequency", "prism", "refraction", "reflection", "spectrum", "diffraction"],
    tactile: {
      conceptType: "physics",
      title: "Hands-On Wave Mechanics & Optics Lab",
      subtitle: "Emit coherent light waves, refract through a prism, and observe spectral dispersion!",
      badge: "Waves & Optics",
      accentColor: "purple",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Coherent Light Emitter",
          role: "Wave Oscillator Source",
          symbol: "λ_0",
          desc: "Emits electromagnetic wave oscillations across visible frequencies.",
          howItWorks: "Atomic electron transitions emit quantized photon wave packets traveling at c = 3×10⁸ m/s.",
          icon: "Sun",
          color: "blue",
          fact: "Light behaves as both continuous waves and discrete photon particles (wave-particle duality)!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Refractive Glass Prism",
          role: "Optical Phase Shifter",
          symbol: "n = 1.52",
          desc: "Denser medium that slows wave phase velocity and bends wave fronts.",
          howItWorks: "Snell's Law: n₁·sin(θ₁) = n₂·sin(θ₂)—different wavelengths bend at distinct angles.",
          icon: "Layers",
          color: "purple",
          fact: "Violet light bends more sharply than red light because it has a higher refractive index in glass!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Dispersion Spectrum",
          role: "Separated Wavelength Bands",
          symbol: "ROYGBIV",
          desc: "Reveals the continuous spectrum of electromagnetic wavelengths from 400nm to 700nm.",
          howItWorks: "Angular dispersion separates white light into distinct visible spectral bands.",
          icon: "Sparkles",
          color: "emerald",
          fact: "Rainbows occur in nature through identical refraction and dispersion inside water droplets!"
        }
      ],
      flow1to2: "🌊 Incident Wave (λ) ➔ Enters Optical Refraction Boundary",
      flow2to3: "💎 Angular Dispersion ➔ Separates Component Spectral Wavelengths",
      systemPrinciple: "Wave Equation & Refraction: v = f · λ | Snell's Law: n₁ sin θ₁ = n₂ sin θ₂",
      pulseLabel: "Pulse Coherent Laser Wave",
      successTitle: "Optical Wavefront Refracted & Dispersed!",
      successSummary: "Coherent wave oscillations bend through the optical prism, dispersing white light into its constituent rainbow wavelengths via Snell's Law!"
    },
    kinesthetic: {
      title: "Refract the Optical Wave",
      items: [
        { id: "light_source", label: "LIGHT EMITTER", color: "blue", desc: "Coherent wavefront" },
        { id: "prism", label: "REFRACTIVE PRISM", color: "purple", desc: "Phase velocity modifier" },
        { id: "spectrum", label: "SPECTRAL BANDS", color: "emerald", desc: "Dispersed wavelength bands" }
      ],
      success: "OPTICAL DISPERSION ACHIEVED!",
      educationalTakeaway: "You routed light waves through the refractive prism, demonstrating how different frequencies travel at different phase speeds to split into a continuous spectrum.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/40 via-blue-950/30 to-black",
      instructions: [
        "1. Position LIGHT EMITTER into Target 1 to project incident wavefronts.",
        "2. Align REFRACTIVE PRISM into Target 2 to induce wavelength-dependent bending.",
        "3. Capture SPECTRAL BANDS in Target 3 to display the dispersed rainbow spectrum."
      ]
    }
  },

  // 8. Chemical Reactions & Molecular Bonding
  {
    keywords: ["chem", "reaction", "acid", "base", "molecule", "bond", "catalyst", "reactant", "stoichiometry", "endothermic"],
    tactile: {
      conceptType: "chemistry",
      title: "Hands-On Chemical Reaction & Bonding Lab",
      subtitle: "Mix the chemical reactants, lower activation energy with a catalyst, and bond into stable products!",
      badge: "Chemical Synthesis",
      accentColor: "teal",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Chemical Reactants",
          role: "Initial Molecular Precursors",
          symbol: "Reactants",
          desc: "Raw atoms and molecules containing potential chemical bond enthalpy.",
          howItWorks: "Molecules collide with thermal kinetic energy trying to overcome electronic repulsion.",
          icon: "Droplets",
          color: "blue",
          fact: "Law of Conservation of Mass: Mass of reactants strictly equals mass of synthesized products!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Enzyme / Catalyst",
          role: "Activation Energy Reducer",
          symbol: "E_a Barrier",
          desc: "Provides alternative reaction pathway to dramatically accelerate reaction rate.",
          howItWorks: "Stabilizes transition state intermediates without being consumed in the reaction.",
          icon: "Zap",
          color: "amber",
          fact: "Catalysts can speed up chemical reactions by millions of times without altering equilibrium!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Synthesized Products",
          role: "Stable Molecular Bonds",
          symbol: "Products",
          desc: "Target molecules formed by newly configured covalent and ionic chemical bonds.",
          howItWorks: "Atoms achieve full outer electron valence shells, minimizing thermodynamic free energy.",
          icon: "Sparkles",
          color: "emerald",
          fact: "Exothermic reactions release excess bond energy into the surrounding environment as heat!"
        }
      ],
      flow1to2: "🧪 Reactant Collisions ➔ Overcomes Activation Energy Barrier (E_a)",
      flow2to3: "⚡ Catalytic Transition ➔ Synthesizes Stable Molecular Bonds",
      systemPrinciple: "Chemical Equilibrium: Reactants + E_a ➔ Transition State ➔ Stable Products",
      pulseLabel: "Inject Reaction Activation Energy",
      successTitle: "Chemical Reaction Reached Equilibrium!",
      successSummary: "Reactants passed the catalytic transition state to form stable chemical bonds, fulfilling the law of conservation of mass and releasing reaction enthalpy!"
    },
    kinesthetic: {
      title: "Synthesize the Chemical Compound",
      items: [
        { id: "reactants", label: "REACTANTS", color: "blue", desc: "Chemical precursor molecules" },
        { id: "catalyst", label: "CATALYST", color: "amber", desc: "Activation energy modifier" },
        { id: "products", label: "PRODUCTS", color: "emerald", desc: "Synthesized molecular compound" }
      ],
      success: "CHEMICAL SYNTHESIS COMPLETE!",
      educationalTakeaway: "You merged reactants through the catalytic reaction pathway, configuring stable molecular bonds while conserving atomic mass and energy.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/40 via-cyan-950/30 to-black",
      instructions: [
        "1. Place REACTANTS in Target 1 to supply the molecular starting materials.",
        "2. Add the CATALYST in Target 2 to lower the activation energy barrier.",
        "3. Synthesize the PRODUCTS in Target 3 to complete the chemical reaction."
      ]
    }
  },

  // 9. Water Cycle & Hydrology
  {
    keywords: ["water cycle", "evaporation", "condensation", "precipitation", "hydrology", "atmosphere", "rain", "cloud"],
    tactile: {
      conceptType: "general",
      title: "Hands-On Global Water Cycle Lab",
      subtitle: "Evaporate surface water into the atmosphere, condense into clouds, and precipitate rain!",
      badge: "Earth & Atmospheric Science",
      accentColor: "blue",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Solar Evaporation",
          role: "Thermal Liquid-to-Gas Influx",
          symbol: "H2O (g)",
          desc: "Solar heat energizes ocean and lake molecules to break hydrogen bonds and vaporize.",
          howItWorks: "Thermal energy increases water vapor buoyancy, carrying moisture high into the troposphere.",
          icon: "Sun",
          color: "amber",
          fact: "Over 85% of all global evaporation originates from our planetary oceans!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Cloud Condensation",
          role: "Atmospheric Phase Change",
          symbol: "Nucleation",
          desc: "Cooling air causes water vapor to condense around microscopic aerosol nuclei.",
          howItWorks: "Latent heat of condensation releases thermal energy while billions of droplets form clouds.",
          icon: "Droplets",
          color: "blue",
          fact: "A typical cumulus cloud weighs approximately 500,000 kilograms (1.1 million pounds)!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Precipitation & Runoff",
          role: "Gravitational Water Return",
          symbol: "H2O (l)",
          desc: "Coalesced heavy droplets fall under gravity as rain, snow, or hail into rivers.",
          howItWorks: "Gravity pulls precipitation into groundwater aquifers and rivers, completing the global cycle.",
          icon: "Sparkles",
          color: "teal",
          fact: "The same water cycling today was present on Earth over 4 billion years ago!"
        }
      ],
      flow1to2: "☀️ Thermal Vaporization ➔ Atmospheric Ascent & Cloud Nucleation",
      flow2to3: "☁️ Droplet Coalescence ➔ Gravitational Precipitation & Ground Runoff",
      systemPrinciple: "Hydrologic Equilibrium: Solar Evaporation ➔ Cloud Condensation ➔ Gravitational Rain",
      pulseLabel: "Trigger Atmospheric Moisture Surge",
      successTitle: "Global Water Cycle in Dynamic Equilibrium!",
      successSummary: "Solar heating vaporizes surface water, high-altitude cooling condenses vapor into cloud reservoirs, and gravity precipitates rain back to replenish continental aquifers!"
    },
    kinesthetic: {
      title: "Circulate the Hydrologic Cycle",
      items: [
        { id: "evaporation", label: "EVAPORATION", color: "amber", desc: "Solar moisture vaporization" },
        { id: "condensation", label: "CONDENSATION", color: "blue", desc: "Cloud aerosol nucleation" },
        { id: "precipitation", label: "PRECIPITATION", color: "teal", desc: "Gravitational rain runoff" }
      ],
      success: "HYDROLOGIC CYCLE OPERATIONAL!",
      educationalTakeaway: "You completed the planetary water cycle! Solar energy lifts water vapor into the atmosphere, condensation gathers clouds, and gravity precipitates water back to Earth.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-teal-950/30 to-black",
      instructions: [
        "1. Activate EVAPORATION in Target 1 to lift moisture into the atmosphere.",
        "2. Form CONDENSATION clouds in Target 2 as rising vapor cools.",
        "3. Trigger PRECIPITATION in Target 3 to return water to rivers and aquifers."
      ]
    }
  },

  // 10. Plate Tectonics & Earthquakes
  {
    keywords: ["tectonic", "plate", "earthquake", "geology", "volcano", "crust", "mantle", "seismic", "subduction"],
    tactile: {
      conceptType: "physics",
      title: "Hands-On Plate Tectonics & Seismic Lab",
      subtitle: "Drive mantle convection, build stress along fault boundaries, and release seismic energy!",
      badge: "Geophysics & Earth Science",
      accentColor: "red",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Mantle Convection Cell",
          role: "Asthenosphere Thermal Engine",
          symbol: "Convection",
          desc: "Radioactive decay in Earth's core heats semi-molten magma into circulating currents.",
          howItWorks: "Buoyant hot magma ascends while cool rock sinks, dragging tectonic plates across the surface.",
          icon: "Flame",
          color: "red",
          fact: "Tectonic plates move at approximately the same rate human fingernails grow (2-5 cm/year)!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Fault Boundary Lock",
          role: "Elastic Strain Accumulation",
          symbol: "Strain (σ)",
          desc: "Frictional resistance locks plate edges, accumulating immense elastic strain energy.",
          howItWorks: "Locked rock resists continuous mantle drag until shear stress exceeds rock friction.",
          icon: "Layers",
          color: "amber",
          fact: "The San Andreas fault is a strike-slip boundary spanning over 1,200 kilometers!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Seismic Wave Rupture",
          role: "Kinetic Energy Discharge",
          symbol: "P & S Waves",
          desc: "Sudden rupture radiates Primary (compressional) and Secondary (shear) seismic shockwaves.",
          howItWorks: "Elastic rebound releases millions of joules of kinetic energy through Earth's crust.",
          icon: "Zap",
          color: "teal",
          fact: "The Richter logarithmic scale means each unit increase represents 32x more energy released!"
        }
      ],
      flow1to2: "🌋 Mantle Convection ➔ Accumulates Elastic Stress Along Fault Boundary",
      flow2to3: "⚡ Frictional Failure ➔ Radiates High-Energy Seismic Shockwaves",
      systemPrinciple: "Plate Geodynamics: Core Heat ➔ Mantle Convection ➔ Elastic Strain ➔ Seismic Release",
      pulseLabel: "Simulate Subterranean Seismic Rupture",
      successTitle: "Tectonic Geodynamic Cycle Mastered!",
      successSummary: "Mantle convection drove tectonic plate collision, accumulating elastic strain along fault lines until catastrophic shear failure discharged seismic shockwaves!"
    },
    kinesthetic: {
      title: "Simulate Plate Tectonic Rupture",
      items: [
        { id: "convection", label: "MANTLE CONVECTION", color: "red", desc: "Thermal driving current" },
        { id: "fault_line", label: "FAULT BOUNDARY", color: "amber", desc: "Elastic strain lock" },
        { id: "seismic_wave", label: "SEISMIC WAVE", color: "teal", desc: "Discharged shockwaves" }
      ],
      success: "SEISMIC RELEASE SIMULATION BALANCED!",
      educationalTakeaway: "You demonstrated plate tectonics! Subsurface mantle convection drags lithospheric plates, building strain along locked faults until kinetic seismic waves rupture through the crust.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-amber-950/30 to-black",
      instructions: [
        "1. Position MANTLE CONVECTION into Target 1 to start subterranean plate motion.",
        "2. Align the FAULT BOUNDARY into Target 2 to accumulate elastic strain.",
        "3. Release SEISMIC WAVES in Target 3 to dissipate energy across the crust."
      ]
    }
  },

  // 11. Computer Science: Algorithms & Data Processing
  {
    keywords: ["algorithm", "data", "sort", "search", "program", "code", "software", "binary", "computer", "compiler"],
    tactile: {
      conceptType: "general",
      title: "Hands-On Algorithmic Data Pipeline Lab",
      subtitle: "Feed raw data arrays, apply algorithmic logic transformation, and yield optimized output!",
      badge: "Computer Science",
      accentColor: "indigo",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "Raw Input Stream",
          role: "Unsorted Data Arrays",
          symbol: "Input[n]",
          desc: "Raw, unsorted, or unstructured data packets entering the computational pipeline.",
          howItWorks: "Memory allocates contiguous buffer space for array traversal and pointer indexing.",
          icon: "Layers",
          color: "blue",
          fact: "Big-O notation measures how processing time scales as input size (n) grows toward infinity!"
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "Algorithmic Transform",
          role: "Logic Engine & Conditionals",
          symbol: "O(n log n)",
          desc: "Executes divide-and-conquer, iterative loops, and comparative branches.",
          howItWorks: "Recursively partitions elements to minimize comparative operations and cache misses.",
          icon: "Zap",
          color: "purple",
          fact: "QuickSort and MergeSort achieve optimal O(n log n) comparison-based sorting time!"
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "Optimized Output",
          role: "Deterministic Clean Result",
          symbol: "Output[]",
          desc: "Sorted, verified, and structured data ready for downstream indexing and user queries.",
          howItWorks: "Guarantees invariant ordering and sub-millisecond lookup latency.",
          icon: "Sparkles",
          color: "emerald",
          fact: "Binary search on sorted arrays locates any item among 1 billion elements in just 30 comparisons!"
        }
      ],
      flow1to2: "📥 Stream Ingestion ➔ Recursive Sorting & Algorithmic Partitioning",
      flow2to3: "⚙️ Logic Execution ➔ Verified Deterministic Output Indexing",
      systemPrinciple: "Algorithmic Pipeline: Raw Input Data ➔ Algorithmic Processing ➔ Optimized Structured Output",
      pulseLabel: "Execute Algorithmic Batch Process",
      successTitle: "Algorithmic Pipeline Execution Complete!",
      successSummary: "Unstructured data was ingested, partitioned via algorithmic divide-and-conquer logic, and transformed into an optimal structured output with verified O(n log n) efficiency!"
    },
    kinesthetic: {
      title: "Execute the Computational Pipeline",
      items: [
        { id: "input_data", label: "RAW INPUT", color: "blue", desc: "Unsorted array stream" },
        { id: "logic_engine", label: "LOGIC ENGINE", color: "purple", desc: "Algorithmic partition" },
        { id: "sorted_output", label: "SORTED OUTPUT", color: "emerald", desc: "Indexed result structure" }
      ],
      success: "ALGORITHM EXECUTED & DATA VERIFIED!",
      educationalTakeaway: "You structured an algorithmic pipeline! Raw inputs were processed through logical transformation branches to produce an organized, query-optimized output.",
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-purple-950/30 to-black",
      instructions: [
        "1. Ingest RAW INPUT into Target 1 to feed the computational memory buffer.",
        "2. Execute the LOGIC ENGINE in Target 2 to partition and compare elements.",
        "3. Output the SORTED OUTPUT in Target 3 to complete the algorithmic pipeline."
      ]
    }
  }
];

/**
 * Universal Algorithmic Topic Extractor
 * Generates pedagogically accurate curriculum models for ANY topic in the universe.
 */
function extractUniversalTopicModel(title: string, content: string): LessonCurriculumModels {
  // Clean and extract primary theme words
  const cleanTitle = (title || "Advanced Topic")
    .replace(/^(introduction to|exploring|understanding|comprehensive guide to|basics of|principles of|study of)\s+/i, "")
    .trim();
  
  const words = cleanTitle.split(/\s+/).filter(w => w.length > 2 && !/^(the|and|for|with|from|into|about)$/i.test(w));
  const mainSubject = words.length > 0 ? words.slice(0, 3).join(" ") : cleanTitle;
  const uppercaseSubject = mainSubject.toUpperCase();

  // Pick semantic category color palette based on string hash
  const hash = mainSubject.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes: Array<{ c1: 'red' | 'blue' | 'amber'; c2: 'amber' | 'purple' | 'teal'; c3: 'emerald' | 'blue' | 'teal' }> = [
    { c1: 'red', c2: 'amber', c3: 'emerald' },
    { c1: 'blue', c2: 'purple', c3: 'emerald' },
    { c1: 'amber', c2: 'teal', c3: 'blue' },
    { c1: 'blue', c2: 'amber', c3: 'teal' }
  ];
  const p = palettes[hash % palettes.length];

  // Derive 3 functional pedagogical phases
  const step1Name = `${mainSubject} Input & Influx`;
  const step2Name = `${mainSubject} Transformation Engine`;
  const step3Name = `${mainSubject} Equilibrium Output`;

  const item0Label = `${words[0]?.toUpperCase() || "SOURCE"} INFLUX`;
  const item1Label = `${words[1]?.toUpperCase() || "PROCESS"} ENGINE`;
  const item2Label = `${words[2]?.toUpperCase() || "RESULT"} OUTPUT`;

  return {
    tactile: {
      conceptType: "general",
      title: `Hands-On ${mainSubject} Exploration Lab`,
      subtitle: `Connect the foundational input, active mechanism, and equilibrium output for ${mainSubject}!`,
      badge: "Scientific Inquiry",
      accentColor: p.c2,
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: step1Name,
          role: "Initial Source & Driving Influx",
          symbol: "Input",
          desc: `Supplies the primary driving force and initial parameters required for ${mainSubject}.`,
          howItWorks: `Establishes the fundamental energy or data gradient that initiates the active mechanism in ${mainSubject}.`,
          icon: "Layers",
          color: p.c1,
          fact: `Every stable system in ${mainSubject} requires well-defined boundary conditions and input gradients!`
        },
        {
          id: "item2",
          stepNumber: 2,
          name: step2Name,
          role: "Active Mechanism & Transformation",
          symbol: "Process",
          desc: `The central interactive engine that transforms and governs interactions in ${mainSubject}.`,
          howItWorks: `Applies physical laws, logical rules, or biochemical pathways to convert incoming inputs into dynamic work.`,
          icon: "Zap",
          color: p.c2,
          fact: `The central mechanism dictates efficiency and stability throughout the lifecycle of ${mainSubject}!`
        },
        {
          id: "item3",
          stepNumber: 3,
          name: step3Name,
          role: "Equilibrium State & Work Output",
          symbol: "Output",
          desc: `The balanced final state demonstrating the completed operation of ${mainSubject}.`,
          howItWorks: `Reaches thermodynamic or logical equilibrium, outputting observable work, products, or stable states.`,
          icon: "Sparkles",
          color: p.c3,
          fact: `When all 3 stages align, the system achieves predictable operational harmony!`
        }
      ],
      flow1to2: `⚡ Input Gradient ➔ Fuels Active Transformation in ${mainSubject}`,
      flow2to3: `⚙️ Core Mechanism ➔ Achieves Stable Equilibrium & Measurable Output`,
      systemPrinciple: `${mainSubject} Systemic Cycle: Baseline Influx ➔ Active Transformation ➔ Equilibrium State`,
      pulseLabel: `Test ${mainSubject} Reaction Pulse`,
      successTitle: `${mainSubject} Operating in Complete Harmony!`,
      successSummary: `All three core pillars of ${mainSubject} are synchronized: the input gradient drives the central transformation engine to achieve steady-state equilibrium and full operational mastery!`
    },
    kinesthetic: {
      title: `Assemble the ${mainSubject} Simulation`,
      items: [
        { id: "item0", label: item0Label, color: p.c1, desc: `Initial driving factor of ${mainSubject}` },
        { id: "item1", label: item1Label, color: p.c2, desc: `Core functional engine of ${mainSubject}` },
        { id: "item2", label: item2Label, color: p.c3, desc: `Resulting balanced state of ${mainSubject}` }
      ],
      success: `${uppercaseSubject} SIMULATION MASTERED!`,
      educationalTakeaway: `You successfully assembled the core components of ${mainSubject}! By connecting the input gradient through the transformation engine to the equilibrium state, you verified the principles governing this system.`,
      layout: "linear",
      bgClass: "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-teal-950/20 to-black",
      instructions: [
        `1. Position ${item0Label} into Target 1 to provide the initial driving input.`,
        `2. Align ${item1Label} into Target 2 to activate the central transformation engine.`,
        `3. Place ${item2Label} into Target 3 to complete the system and reach equilibrium.`
      ]
    }
  };
}

/**
 * Main Curriculum Resolver
 * Intelligently resolves or synthesizes complete Tactile and Kinesthetic models
 * for ANY lesson object in the application.
 */
export function buildLessonCurriculum(lesson: any): LessonCurriculumModels {
  const title = (lesson?.title || "").trim();
  const desc = (lesson?.description || "").trim();
  const content = (lesson?.content || "").trim();
  const combinedText = `${title} ${desc} ${content}`.toLowerCase();

  // 1. Check for embedded TACTILE_DATA comment in lesson content or description
  const match = content.match(/<!--\s*TACTILE_DATA:\s*([\s\S]*?)\s*-->/) ||
                desc.match(/<!--\s*TACTILE_DATA:\s*([\s\S]*?)\s*-->/);
  
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1].trim());
      
      // If parsed contains both tactile_sandbox and kinesthetic, return them directly
      if (parsed.tactile_sandbox && parsed.kinesthetic && parsed.kinesthetic.items && parsed.kinesthetic.items.length === 3) {
        return {
          tactile: parsed.tactile_sandbox,
          kinesthetic: {
            title: parsed.kinesthetic.title || `Simulate ${title}`,
            items: parsed.kinesthetic.items,
            success: parsed.kinesthetic.success || `${title.toUpperCase()} COMPLETE!`,
            educationalTakeaway: parsed.kinesthetic.educationalTakeaway || "All components linked into operational harmony.",
            layout: parsed.kinesthetic.layout || 'linear',
            bgClass: parsed.kinesthetic.bgClass || "bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-teal-950/20 to-black",
            instructions: parsed.kinesthetic.instructions || [
              `1. Place ${parsed.kinesthetic.items[0]?.label || 'Component 1'}.`,
              `2. Place ${parsed.kinesthetic.items[1]?.label || 'Component 2'}.`,
              `3. Place ${parsed.kinesthetic.items[2]?.label || 'Component 3'}.`
            ]
          }
        };
      }

      // If it only has kinesthetic, synthesize tactile to match
      if (parsed.kinesthetic && parsed.kinesthetic.items && parsed.kinesthetic.items.length === 3) {
        const fallback = extractUniversalTopicModel(title, content);
        return {
          tactile: fallback.tactile,
          kinesthetic: {
            title: parsed.kinesthetic.title || fallback.kinesthetic.title,
            items: parsed.kinesthetic.items,
            success: parsed.kinesthetic.success || fallback.kinesthetic.success,
            educationalTakeaway: parsed.kinesthetic.educationalTakeaway || fallback.kinesthetic.educationalTakeaway,
            layout: parsed.kinesthetic.layout || fallback.kinesthetic.layout,
            bgClass: parsed.kinesthetic.bgClass || fallback.kinesthetic.bgClass,
            instructions: parsed.kinesthetic.instructions || fallback.kinesthetic.instructions
          }
        };
      }
    } catch (e) {
      console.warn("Failed to parse embedded TACTILE_DATA, falling back to intelligent knowledge base:", e);
    }
  }

  // 2. Scan Domain Knowledge Base for exact thematic match
  for (const domain of DOMAIN_KNOWLEDGE_BASE) {
    if (domain.keywords.some(kw => combinedText.includes(kw))) {
      return {
        tactile: domain.tactile,
        kinesthetic: domain.kinesthetic
      };
    }
  }

  // 3. Fallback to Algorithmic Universal Concept Extractor (handles any universe topic!)
  return extractUniversalTopicModel(title, content);
}
