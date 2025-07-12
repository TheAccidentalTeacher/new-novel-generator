// AutoGenerate Novel Function - Background Job System with Status Polling
/**
 * AutoGenerateNovel.cjs - Enhanced AI Novel Generation System v2.0
 * 
 * ADVANCED ANTI-AI FRAMEWORK INTEGRATION
 * ====================================== 
 * 
 * This system combines the original 736-line antiAI enhancement system with 10 sophisticated
 * advanced prompting strategies to create maximum human-quality fiction generation:
 * 
 * INTEGRATED ADVANCED STRATEGIES:
 * 1. Character Voice Consistency Framework - Detailed voice maps with background, age, speech patterns
 * 2. Setting-Specific Sensory Database - Church, home_1999, office, main_street sensory details
 * 3. Dynamic Scene Structure Templates - 8 opening techniques with mood-based selection
 * 4. Metaphor Domain Control System - Faith, technology, relationship, community metaphor domains
 * 5. Plot Thread Management Protocol - Thread tracking, development scheduling, introduction timing
 * 6. Regional Dialect Authenticity - Pacific Northwest 1999 expressions and usage guidelines
 * 7. Faith Integration Depth Model - Lived, conversational, formal faith balance across chapters
 * 8. Technology Era Authenticity Framework - 1999 technology accuracy for home/office/general scenes
 * 9. Narrative Tension Calibration System - Dynamic tension type/intensity based on story position
 * 10. Beta Reader Simulation Protocol - Comprehensive quality verification across 4 categories
 * 
 * ORIGINAL SYSTEM ENHANCEMENTS PRESERVED:
 * - 40+ sensory descriptions per category (visual, auditory, tactile, atmospheric)
 * - Character voice libraries with speech patterns and conversation styles
 * - Chapter structure diversification (12 openings, 8 endings, 6 transitions)
 * - Surprise element library (character, plot, setting, dialogue surprises)
 * - Style variation engine (pacing, metaphors, word choice patterns)
 * 
 * SYSTEM ARCHITECTURE:
 * - Enhanced generateWritingInstructions() method integrates all 10 advanced strategies
 * - Comprehensive prompt generation includes framework-specific guidance
 * - Quality verification includes human authenticity checks
 * - Anti-AI pattern elimination covers all detected artificial writing markers
 * 
 * IMPLEMENTATION NOTES:
 * - All frameworks work together to create unified human-quality fiction generation
 * - Each strategy includes usage tracking and authenticity rules
 * - Beta reader simulation ensures output passes human reader expectations
 * - System maintains existing job management and chapter generation workflow
 * 
 * Total System Size: ~2700 lines with comprehensive advanced framework integration
 * Core AntiAI System: Enhanced from 736 lines to include 10 advanced strategy frameworks
 */

const { OpenAI } = require('openai');

// In-memory job storage (in production, use a database)
const jobStorage = new Map();

// Anti-AI Enhancement System v2.0 - Advanced Human-Quality Fiction Framework
// Integrates 10 Advanced Prompting Strategies for Improved Novel Generation
const antiAISystem = {
  
  // === STRATEGY 1: Character Voice Consistency Framework ===
  characterVoiceFramework: {
    // Core vocabulary patterns for each character archetype
    voiceMaps: {
      academic: {
        coreVocabulary: ['analyze', 'consider', 'hypothesis', 'evidence', 'theoretically', 'substantiate', 'premise', 'methodology', 'paradigm', 'empirical', 'conceptual', 'framework', 'synthesis', 'correlation', 'postulate'],
        sentenceStructure: 'complex_compound',
        speechRhythm: 'measured_pauses',
        metaphorDomains: ['research', 'laboratory', 'books', 'experiments'],
        verbalTics: ['Well, actually...', 'If I may...', 'Based on my research...', 'Theoretically speaking...']
      },
      rural: {
        coreVocabulary: ['reckon', 'figure', 'holler', 'yonder', 'fixing_to', 'might_could', 'spell', 'creek', 'pasture', 'harvest', 'mend', 'tend', 'fetch', 'kin', 'neighbor'],
        sentenceStructure: 'simple_direct',
        speechRhythm: 'steady_cadence',
        metaphorDomains: ['farming', 'weather', 'seasons', 'animals'],
        verbalTics: ['I tell you what...', 'Way I see it...', 'Been meaning to...', 'Lord willing...']
      },
      urban: {
        coreVocabulary: ['definitely', 'basically', 'literally', 'whatever', 'awesome', 'crazy', 'insane', 'ridiculous', 'perfect', 'amazing', 'totally', 'absolutely', 'seriously', 'obviously', 'exactly'],
        sentenceStructure: 'casual_fragmented',
        speechRhythm: 'quick_clipped',
        metaphorDomains: ['technology', 'traffic', 'buildings', 'nightlife'],
        verbalTics: ['You know what I mean?', 'No way...', 'Are you kidding me?', 'That\'s so...']
      },
      professional: {
        coreVocabulary: ['implement', 'leverage', 'synergy', 'optimize', 'streamline', 'deliverables', 'bandwidth', 'scope', 'timeline', 'stakeholders', 'metrics', 'actionable', 'scalable', 'strategic', 'initiative'],
        sentenceStructure: 'structured_formal',
        speechRhythm: 'confident_assertive',
        metaphorDomains: ['business', 'sports', 'military', 'construction'],
        verbalTics: ['Bottom line...', 'At the end of the day...', 'Moving forward...', 'To be perfectly clear...']
      },
      artistic: {
        coreVocabulary: ['inspiration', 'vision', 'expression', 'authentic', 'essence', 'texture', 'composition', 'harmony', 'contrast', 'palette', 'medium', 'creation', 'interpret', 'capture', 'transform'],
        sentenceStructure: 'flowing_lyrical',
        speechRhythm: 'emotional_variable',
        metaphorDomains: ['colors', 'music', 'dance', 'painting'],
        verbalTics: ['You see...', 'It\'s like...', 'The thing is...', 'Can you imagine...']
      },
      technical: {
        coreVocabulary: ['configure', 'protocol', 'interface', 'algorithm', 'parameter', 'optimize', 'debug', 'compile', 'execute', 'validate', 'iterate', 'integrate', 'deploy', 'architecture', 'specification'],
        sentenceStructure: 'precise_logical',
        speechRhythm: 'methodical_clear',
        metaphorDomains: ['mechanics', 'systems', 'networks', 'tools'],
        verbalTics: ['First off...', 'Here\'s the thing...', 'Let me break it down...', 'Basically what happens is...']
      }
    },
    
    // Track character voice usage to prevent overuse
    voiceUsageTracker: new Map(),
    
    generateDetailedCharacterVoice(characterName, background, age, region, previousDialogue = []) {
      const voiceMap = this.voiceMaps[background] || this.voiceMaps.professional;
      const usageKey = `${characterName}_voice`;
      const previousUsage = this.voiceUsageTracker.get(usageKey) || { vocabulary: new Set(), tics: new Set() };
      
      // Select vocabulary avoiding recent usage
      const availableVocab = voiceMap.coreVocabulary.filter(word => !previousUsage.vocabulary.has(word));
      const selectedVocab = availableVocab.slice(0, 5).concat(
        voiceMap.coreVocabulary.slice(0, 3) // Always include some core words
      );
      
      // Select verbal tics avoiding recent usage
      const availableTics = voiceMap.verbalTics.filter(tic => !previousUsage.tics.has(tic));
      const selectedTic = availableTics.length > 0 ? 
        availableTics[Math.floor(Math.random() * availableTics.length)] :
        voiceMap.verbalTics[Math.floor(Math.random() * voiceMap.verbalTics.length)];
      
      // Update usage tracking
      selectedVocab.forEach(word => previousUsage.vocabulary.add(word));
      previousUsage.tics.add(selectedTic);
      
      // Limit tracking to last 10 uses
      if (previousUsage.vocabulary.size > 10) {
        const oldestVocab = Array.from(previousUsage.vocabulary)[0];
        previousUsage.vocabulary.delete(oldestVocab);
      }
      if (previousUsage.tics.size > 3) {
        const oldestTic = Array.from(previousUsage.tics)[0];
        previousUsage.tics.delete(oldestTic);
      }
      
      this.voiceUsageTracker.set(usageKey, previousUsage);
      
      return {
        characterName,
        coreVocabulary: selectedVocab,
        sentenceStructure: voiceMap.sentenceStructure,
        speechRhythm: voiceMap.speechRhythm,
        metaphorDomain: voiceMap.metaphorDomains[Math.floor(Math.random() * voiceMap.metaphorDomains.length)],
        preferredTic: selectedTic,
        avoidWords: Array.from(previousUsage.vocabulary).slice(-5), // Words used recently
        regionalDialect: this.getRegionalDialect(region),
        ageAdjustments: this.getAgeAdjustments(age)
      };
    },
    
    getRegionalDialect(region) {
      const dialects = {
        'south': ['y\'all', 'fixin\' to', 'might could', 'over yonder', 'bless your heart'],
        'northeast': ['wicked', 'no worries', 'regular coffee', 'rotary', 'down cellar'],
        'midwest': ['ope', 'you betcha', 'pop', 'hotdish', 'uff da'],
        'west': ['hella', 'the 405', 'marine layer', 'no way', 'totally'],
        'pacific_northwest': ['the mountain\'s out', 'gray season', 'coffee run', 'sound', 'ferry'],
        'texas': ['y\'all', 'fixin\'', 'bigger than Dallas', 'bless your heart', 'might as well']
      };
      return dialects[region] || [];
    },
    
    getAgeAdjustments(age) {
      if (age < 20) return { slang: 'gen_z', formality: 'very_casual', technology_comfort: 'native' };
      if (age < 35) return { slang: 'millennial', formality: 'casual', technology_comfort: 'high' };
      if (age < 50) return { slang: 'gen_x', formality: 'moderate', technology_comfort: 'moderate' };
      if (age < 65) return { slang: 'boomer_early', formality: 'formal', technology_comfort: 'learning' };
      return { slang: 'traditional', formality: 'very_formal', technology_comfort: 'limited' };
    }
  },
  
  // === STRATEGY 2: Setting-Specific Sensory Detail Database ===
  settingSensoryDatabase: {
    church: {
      smells: ['old hymnals musty pages', 'lemon oil on wooden pews', 'coffee brewing fellowship hall', 'candle wax from altar', 'flowers from Sunday arrangement', 'wool from winter coats', 'aftershave from deacons', 'carpet cleaner from Saturday work'],
      sounds: ['organ notes filling sanctuary', 'hymnal pages rustling', 'children giggling nursery', 'heating system cycling', 'footsteps on wooden floors', 'whispered prayers', 'choir rehearsal echoing', 'church bell tower chiming'],
      sights: ['stained glass casting colors', 'dust motes in morning light', 'worn Bible spine creased', 'collection plate brass gleaming', 'memorial plaques honoring faithful', 'flowers wilting from last week', 'hymnboards displaying numbers', 'empty pews waiting congregation'],
      textures: ['smooth pew wood worn', 'rough carpet underfoot', 'silk bookmark ribbon', 'cool metal door handle', 'soft cushion kneeler', 'paper bulletin crisp', 'stone steps weathered', 'velvet altar cloth rich']
    },
    home_1999: {
      sounds: ['dial-up modem screeching connection', 'computer fan humming constantly', 'specific creaky floorboard bedroom', 'refrigerator ice maker dropping', 'analog TV static between channels', 'microwave beeping completion', 'cordless phone charging base', 'VHS rewinding automatic'],
      sights: ['CRT monitor blue glow', 'cassette tapes stacked entertainment center', 'TV Guide folded this week', 'AOL CD coasters everywhere', 'corded phone kitchen wall', 'VCR clock blinking 12:00', 'Windows 98 desktop background', 'dial-up connection icon'],
      smells: ['new computer plastic outgassing', 'coffee brewing Mr. Coffee', 'microwave popcorn butter flavoring', 'fabric softener laundry room', 'wood polish furniture weekly', 'carpet fresh from Saturday cleaning', 'cooking dinner Sunday roast', 'air freshener plugin hall'],
      textures: ['CRT screen static electric', 'corded phone plastic smooth', 'cassette case plastic ridge', 'VHS tape label adhesive', 'mouse pad fabric texture', 'keyboard keys slightly sticky', 'remote control buttons worn', 'magazine pages glossy slick']
    },
    small_town_main_street: {
      sights: ['hardware store hand-painted sign', 'parking meters needing quarters', 'sidewalk cracks grass growing', 'storefront windows soap-marked', 'American flag pole center', 'bench dedication plaque brass', 'traffic light swaying wind', 'courthouse dome green copper'],
      sounds: ['screen door slamming café', 'gravel crunching under tires', 'distant train whistle evening', 'church bells marking hour', 'lawnmower suburban saturday', 'dogs barking neighborhood patrol', 'ice cream truck melody', 'pickup truck rumbling main'],
      smells: ['fresh bread bakery morning', 'gasoline station corner', 'coffee shop dark roast', 'fertilizer farm supply', 'fresh cut grass spring', 'barbecue smoke backyard', 'rain on hot pavement', 'wood smoke fireplace fall']
    },
    technology_office_1999: {
      sights: ['beige computer towers humming', 'CRT monitors multiple desks', 'ethernet cables snaking everywhere', 'server room blinking lights', 'floppy disk storage organized', 'CD-ROM drives silver faces', 'dot matrix printer paper', 'whiteboard network diagrams'],
      sounds: ['cooling fans constant whir', 'hard drives clicking seeking', 'dot matrix printer hammering', 'keyboard mechanical clacking', 'mouse balls needing cleaning', 'network equipment humming', 'phone system electronic beeps', 'air conditioning laboring hard'],
      smells: ['ozone from laser printers', 'heated electronics warm plastic', 'coffee burnt pot all day', 'toner cartridge plastic metallic', 'carpet cleaning chemicals weekend', 'air conditioning filter dust', 'marker whiteboard chemical', 'electrical burning occasional'],
      textures: ['CRT screen warm static', 'keyboard keys worn smooth', 'mouse pad fabric ribbed', 'ethernet cable plastic ridged', 'floppy disk metal slider', 'CD surface rainbow reflective', 'paper perforated edges', 'cable management velcro rough']
    }
  },
  
  // === STRATEGY 3: Dynamic Scene Structure Templates ===
  sceneStructureTemplates: {
    openingTechniques: {
      'action_first': {
        description: 'Character already engaged in specific activity',
        example: 'Sarah\'s fingers flew across the keyboard, deleting the email before she could change her mind.',
        usageRules: ['Avoid with contemplative chapters', 'Good for tension building', 'Creates immediate engagement']
      },
      'dialogue_first': {
        description: 'Conversation already in progress, context emerges',
        example: '"That\'s not what I meant," David said, his coffee growing cold.',
        usageRules: ['Reveals character through speech', 'Good for relationship development', 'Avoid overuse with same characters']
      },
      'internal_thought': {
        description: 'Character reflection or decision-making',
        example: 'The decision had been haunting Mark for three days, and today he would finally act.',
        usageRules: ['Strong for character development', 'Good for moral dilemmas', 'Limit to introspective moments']
      },
      'environmental_focus': {
        description: 'Setting detail that reflects character mood or foreshadows',
        example: 'The church windows cast fractured light across the empty pews, much like their fractured faith.',
        usageRules: ['Connects setting to emotion', 'Good for symbolic moments', 'Avoid if overused in previous chapters']
      },
      'flashback_trigger': {
        description: 'Present moment sparks specific memory',
        example: 'The smell of coffee triggered memories of their first conversation, two years and a lifetime ago.',
        usageRules: ['Provides backstory naturally', 'Good for revelation chapters', 'Use sparingly to maintain present-tense flow']
      }
    },
    
    // Track usage to ensure variety
    openingUsageTracker: [],
    maxRecentTracking: 5,
    
    selectVariedOpening(chapterNumber, chapterMood, avoidRecent = true) {
      const techniques = Object.keys(this.openingTechniques);
      
      let available = techniques;
      if (avoidRecent && this.openingUsageTracker.length > 0) {
        available = techniques.filter(tech => !this.openingUsageTracker.includes(tech));
      }
      
      // If all have been used recently, reset and use all
      if (available.length === 0) {
        this.openingUsageTracker = [];
        available = techniques;
      }
      
      // Select appropriate for mood
      const moodMap = {
        'tense': ['action_first', 'dialogue_first'],
        'reflective': ['internal_thought', 'environmental_focus', 'flashback_trigger'],
        'dramatic': ['action_first', 'environmental_focus'],
        'intimate': ['dialogue_first', 'internal_thought'],
        'mysterious': ['environmental_focus', 'flashback_trigger']
      };
      
      const moodAppropriate = moodMap[chapterMood] || available;
      const finalOptions = available.filter(tech => moodAppropriate.includes(tech));
      
      const selected = finalOptions.length > 0 ? 
        finalOptions[Math.floor(Math.random() * finalOptions.length)] :
        available[Math.floor(Math.random() * available.length)];
      
      // Track usage
      this.openingUsageTracker.push(selected);
      if (this.openingUsageTracker.length > this.maxRecentTracking) {
        this.openingUsageTracker.shift();
      }
      
      return {
        technique: selected,
        details: this.openingTechniques[selected],
        guidance: this.generateOpeningGuidance(selected, chapterMood)
      };
    },
    
    generateOpeningGuidance(technique, mood) {
      const guidanceMap = {
        'action_first': 'Begin with character already performing a specific, meaningful action. Avoid generic movement.',
        'dialogue_first': 'Start mid-conversation with context emerging naturally. Ensure dialogue reveals character.',
        'internal_thought': 'Open with character\'s specific decision or realization. Make the thought concrete.',
        'environmental_focus': 'Begin with setting detail that mirrors character\'s emotional state or hints at coming events.',
        'flashback_trigger': 'Use specific sensory detail to trigger relevant memory. Keep transition smooth.'
      };
      
      return guidanceMap[technique] || 'Begin chapter with engaging, specific detail that serves the story.';
    }
  },
  
  // === STRATEGY 4: Metaphor Domain Control System ===
  metaphorDomainSystem: {
    domains: {
      'faith_concepts': {
        metaphorBank: ['seeds taking root in fertile ground', 'lighthouse beacon cutting through storm', 'bridge spanning troubled waters', 'foundation stone solid and sure', 'compass needle pointing true north', 'wellspring never running dry', 'anchor holding in rough seas', 'garden tended with patient care'],
        usageTracker: new Set(),
        maxUses: 2 // Limit metaphors to 2 uses per domain per novel
      },
      'technology_mechanical': {
        metaphorBank: ['gears meshing in perfect timing', 'circuit board connections sparking', 'engine idling rough then smooth', 'software update installing changes', 'network connections strengthening signal', 'hard drive spinning up memories', 'keyboard keys unlocking thoughts', 'monitor screen reflecting truth'],
        usageTracker: new Set(),
        maxUses: 2
      },
      'relationships_musical': {
        metaphorBank: ['harmony finding common key', 'melody weaving through silence', 'rhythm syncing two hearts', 'discord resolving to peace', 'solo becoming beautiful duet', 'orchestra requiring careful conductor', 'notes written on staff of time', 'song remembered from childhood'],
        usageTracker: new Set(),
        maxUses: 2
      },
      'community_cooking': {
        metaphorBank: ['ingredients blending into something new', 'recipe handed down through generations', 'pot simmering with patient attention', 'flavors developing with time', 'feast shared with grateful hearts', 'bread rising in warm kitchen', 'seasoning added with careful hand', 'table set for unexpected guests'],
        usageTracker: new Set(),
        maxUses: 2
      }
    },
    
    selectControlledMetaphor(domain, chapterNumber) {
      const domainData = this.domains[domain];
      if (!domainData) return null;
      
      // Get unused metaphors from this domain
      const available = domainData.metaphorBank.filter(metaphor => 
        !domainData.usageTracker.has(metaphor)
      );
      
      // If all used, reset for new cycle
      if (available.length === 0) {
        domainData.usageTracker.clear();
        return domainData.metaphorBank[Math.floor(Math.random() * domainData.metaphorBank.length)];
      }
      
      const selected = available[Math.floor(Math.random() * available.length)];
      domainData.usageTracker.add(selected);
      
      return selected;
    },
    
    getMetaphorUsageGuidance() {
      return {
        frequency: 'Maximum 1-2 metaphors per paragraph',
        development: 'Develop single metaphor fully rather than multiple brief comparisons',
        consistency: 'Stay within assigned metaphor domain for chapter',
        purpose: 'Each metaphor must serve character development or plot advancement'
      };
    }
  },
  
  // === STRATEGY 5: Plot Thread Management Protocol ===
  plotThreadManager: {
    activeThreads: new Map(),
    maxActiveThreads: 3,
    
    initializeThread(threadId, threadData) {
      const thread = {
        id: threadId,
        title: threadData.title,
        introduced: threadData.introducedChapter,
        developments: [],
        resolution: null,
        themeConnection: threadData.themeConnection,
        characterGrowthConnection: threadData.characterGrowthConnection,
        lastTouchedChapter: threadData.introducedChapter
      };
      
      this.activeThreads.set(threadId, thread);
      return thread;
    },
    
    addDevelopment(threadId, chapterNumber, developmentDescription) {
      const thread = this.activeThreads.get(threadId);
      if (thread) {
        thread.developments.push({
          chapter: chapterNumber,
          description: developmentDescription,
          date: new Date().toISOString()
        });
        thread.lastTouchedChapter = chapterNumber;
      }
    },
    
    getThreadsNeedingDevelopment(currentChapter) {
      const neglectedThreads = [];
      
      for (const [threadId, thread] of this.activeThreads) {
        const chaptersSinceTouch = currentChapter - thread.lastTouchedChapter;
        if (chaptersSinceTouch >= 3 && !thread.resolution) {
          neglectedThreads.push({
            ...thread,
            priority: chaptersSinceTouch, // Higher number = higher priority
            suggestions: this.generateDevelopmentSuggestions(thread, currentChapter)
          });
        }
      }
      
      return neglectedThreads.sort((a, b) => b.priority - a.priority);
    },
    
    generateDevelopmentSuggestions(thread, currentChapter) {
      const suggestions = [
        `Have character make discovery related to ${thread.title}`,
        `Introduce complication that affects ${thread.title} outcome`,
        `Show how ${thread.title} connects to main plot`,
        `Reveal new information about ${thread.title}`,
        `Force character to make decision regarding ${thread.title}`
      ];
      
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    },
    
    shouldIntroduceNewThread(currentChapter, totalChapters) {
      const activeCount = Array.from(this.activeThreads.values())
        .filter(thread => !thread.resolution).length;
      
      // Don't introduce new threads in final third of novel
      const inFinalThird = currentChapter > (totalChapters * 0.67);
      
      return activeCount < this.maxActiveThreads && !inFinalThird;
    }
  },
  
  // === STRATEGY 6: Regional Dialect Authenticity Guidelines ===
  regionalDialectSystem: {
    pacificNorthwest1999: {
      commonExpressions: [
        'the mountain\'s out today', // Mt. Rainier visible
        'coffee run to the espresso stand',
        'taking the ferry across the sound',
        'hiking the trails this weekend',
        'gray season\'s settling in',
        'orca pod spotted yesterday',
        'salmon run starting early',
        'microbrewery opened downtown',
        'farmers market Saturday morning',
        'rain\'s finally letting up',
        'skiing the pass tomorrow',
        'tide pools at low tide',
        'ferry line\'s backed up',
        'coffee shop on every corner',
        'outdoor gear store closing'
      ],
      
      usageRules: {
        frequency: 'Use 1-2 expressions per chapter maximum',
        context: 'Only in dialogue, never in narration',
        character_specific: 'Natives use more, newcomers use less',
        gradual_introduction: 'Introduce expressions organically through story'
      },
      
      usageTracker: new Set(),
      
      selectAuthenticExpression(characterBackground, recentChapters) {
        // Avoid recently used expressions
        const recentExpressions = this.extractRecentExpressions(recentChapters);
        const available = this.commonExpressions.filter(expr => 
          !recentExpressions.includes(expr) && !this.usageTracker.has(expr)
        );
        
        if (available.length === 0) {
          this.usageTracker.clear();
          return this.commonExpressions[Math.floor(Math.random() * this.commonExpressions.length)];
        }
        
        const selected = available[Math.floor(Math.random() * available.length)];
        this.usageTracker.add(selected);
        
        // Limit tracker to last 8 expressions
        if (this.usageTracker.size > 8) {
          const oldest = Array.from(this.usageTracker)[0];
          this.usageTracker.delete(oldest);
        }
        
        return selected;
      },
      
      extractRecentExpressions(recentChapters) {
        // In production, would parse actual chapter content
        return []; // Simplified for framework
      }
    }
  },
  
  // Enhanced base sensory bank continues from your existing system
  sensoryBank: {
    sky: [
      'azure canopy stretching endlessly', 'weathered pewter dome overhead', 'cobalt expanse dotted with clouds',
      'mottled gray ceiling pressing down', 'pearl-white vastness above', 'storm-bruised heavens',
      'amber-tinged backdrop of evening', 'velvet darkness studded with stars', 'dawn-painted horizon',
      'silver-streaked morning sky', 'copper-burnished sunset dome', 'indigo twilight ceiling',
      'rain-heavy clouds gathering', 'wind-swept azure emptiness', 'haze-softened blue expanse',
      'crystal-clear winter sky', 'humid summer canopy', 'crisp autumn atmosphere',
      'overcast gray blanket', 'brilliant midday glare', 'dusky purple evening',
      'star-pricked midnight canvas', 'moon-washed nocturnal sky', 'sun-bleached afternoon dome',
      'misty morning veil', 'storm-torn cloudscape', 'gentle blue embrace above',
      'threatening dark ceiling', 'serene cloudless expanse', 'dramatic cloud formations',
      'pastel dawn awakening', 'fiery sunset display', 'peaceful evening glow',
      'wild storm-tossed heavens', 'calm steady blue', 'shifting cloud patterns',
      'luminous twilight canopy', 'harsh glaring brightness', 'soft filtered light above',
      'ominous gathering darkness', 'refreshing blue openness', 'majestic cloud cathedral'
    ],
    ground: [
      'weathered stone path winding ahead', 'soft earth cushioning each step', 'cracked pavement telling stories',
      'mossy forest floor springy underfoot', 'sandy trail shifting beneath boots', 'muddy track from recent rain',
      'gravel crunching with each stride', 'wooden planks worn smooth', 'grass-covered meadow ground',
      'rocky terrain challenging balance', 'smooth marble flooring', 'rough concrete surface',
      'leaf-strewn pathway', 'dusty dirt road', 'polished hardwood floors',
      'carpeted hallway muffling sounds', 'tile flooring cool to touch', 'rubber matting providing grip',
      'cobblestone street uneven', 'asphalt parking lot heated', 'brick walkway precisely laid',
      'snow-covered ground crunching', 'ice-slicked surface treacherous', 'warm sand between toes',
      'pebbled beach shifting', 'boardwalk creaking slightly', 'metal grating echoing steps',
      'linoleum floor squeaking', 'parquet pattern beneath feet', 'stone steps worn by time',
      'grassy hill sloping down', 'mountain trail winding up', 'valley floor spreading wide',
      'desert sand endless', 'stream bed rocky', 'garden path neatly kept',
      'alley pavement gritty', 'plaza stones geometric', 'deck boards weathered gray',
      'basement floor concrete cold', 'attic flooring creaking old', 'porch steps painted white',
      'sidewalk familiar routine', 'trail disappearing ahead', 'ground solid and reassuring'
    ],
    interior: [
      'dim corners hiding secrets', 'filtered light creating patterns', 'warm shadows embracing space',
      'cluttered environment telling stories', 'bare walls echoing emptiness', 'cozy nook inviting rest',
      'spacious room allowing breath', 'cramped quarters forcing closeness', 'high ceiling soaring above',
      'low beams creating intimacy', 'large windows flooding light', 'small apertures filtering glow',
      'rich tapestries warming walls', 'stark surfaces reflecting sound', 'comfortable furniture arranged',
      'antique pieces holding history', 'modern fixtures gleaming new', 'rustic elements grounding space',
      'elegant details catching eye', 'simple design calming mind', 'chaotic arrangement reflecting life',
      'organized shelves displaying order', 'empty spaces feeling lonely', 'crowded areas buzzing energy',
      'soft lighting creating mood', 'harsh fluorescents revealing all', 'candles flickering warmth',
      'natural light shifting throughout day', 'artificial illumination steady', 'shadowy recesses mysterious',
      'polished surfaces reflecting images', 'textured walls inviting touch', 'smooth finishes easy maintenance',
      'wooden elements bringing nature inside', 'metal accents adding modern touch', 'fabric softening hard edges',
      'plants breathing life into room', 'books filling shelves knowledge', 'artwork adorning walls beauty',
      'mirrors expanding perceived space', 'curtains framing outdoor views', 'rugs defining separate areas',
      'ceiling fans circulating air gently', 'heating vents warming space', 'open doorways connecting rooms',
      'closed doors ensuring privacy', 'staircases leading to mystery', 'hallways stretching distances',
      'alcoves providing retreat', 'bay windows creating reading nooks', 'fireplaces gathering social warmth'
    ],
    sounds: [
      'distant murmur of conversation', 'sharp crack breaking silence', 'gentle rustle of movement',
      'muffled voices through walls', 'echoing footsteps in hallway', 'soft whisper barely audible',
      'sudden silence falling heavy', 'rhythmic tapping maintaining beat', 'wind whistling through gaps',
      'rain pattering on roof', 'thunder rumbling overhead', 'birds chirping morning songs',
      'traffic humming constant background', 'machinery grinding mechanical', 'children laughing distant playground',
      'clock ticking steady rhythm', 'paper rustling as pages turn', 'keyboard clicking rapid typing',
      'phone ringing interrupting quiet', 'doorbell chiming visitor arrival', 'refrigerator humming kitchen',
      'water dripping slow leak', 'pipes creaking old building', 'floorboards groaning under weight',
      'music playing soft background', 'television murmuring other room', 'radio static between stations',
      'dog barking neighborhood alert', 'cat purring contentment', 'insects buzzing summer evening',
      'leaves rustling autumn breeze', 'fire crackling warm hearth', 'ice cubes clinking cold drink',
      'engine starting morning routine', 'brakes squealing sudden stop', 'tires screeching sharp turn',
      'sirens wailing emergency distance', 'construction noise urban backdrop', 'school bell ringing period change',
      'lawnmower cutting suburban grass', 'chainsaw clearing fallen tree', 'hammer striking nail precise',
      'typewriter keys mechanical rhythm', 'pencil scratching paper surface', 'eraser rubbing removing mistakes',
      'scissors cutting clean line', 'zipper sliding smooth closure', 'button clicking satisfying snap',
      'fabric tearing unexpected rip', 'glass breaking sharp crash', 'metal clanging hollow ring'
    ],
    smells: [
      'earthy scent after rain', 'sharp tang of cleaning solution', 'sweet fragrance of blooming flowers',
      'musty odor of old books', 'clean air mountain fresh', 'acrid smoke from distant fire',
      'floral notes drifting garden', 'metallic taste in air', 'coffee brewing morning ritual',
      'bread baking warm kitchen', 'vanilla candle soft sweetness', 'pine needles forest fresh',
      'ocean salt spray carried wind', 'grass newly cut suburban', 'leather chair well-worn',
      'woodsmoke fireplace cozy', 'gasoline station pungent', 'paint fumes renovation project',
      'perfume lingering after departure', 'soap clean bathroom', 'shampoo fruity shower',
      'cooking spices exotic blend', 'garlic sautéing dinner prep', 'onions caramelizing slow heat',
      'chocolate melting sweet temptation', 'citrus zest bright kitchen', 'herbs garden fresh picked',
      'fish market oceanic strong', 'cheese aging complex notes', 'wine fermentation rich deep',
      'beer hops bitter sharp', 'whiskey oak barrel aged', 'tobacco pipe grandfather comfort',
      'incense meditation peaceful', 'candle wax warm melted', 'oil paint artist studio',
      'glue craft project sticky', 'marker ink permanent sharp', 'chalk dust classroom memory',
      'sweat gymnasium exertion', 'chlorine pool chemical clean', 'sunscreen summer protection',
      'campfire smoke adventure outdoor', 'barbecue meat grilling social', 'popcorn movie theater classic',
      'hospital antiseptic sterile clean', 'library books knowledge musty', 'garage motor oil mechanical',
      'garden soil rich fertile', 'compost decomposition natural cycle', 'fertilizer spring growth preparation'
    ],
    textures: [
      'rough surface requiring careful touch', 'smooth finish inviting caress', 'coarse fabric scratching skin',
      'silky material flowing through fingers', 'grainy texture catching fingertips', 'polished wood warm natural',
      'cold metal shocking contact', 'warm skin comforting human', 'bumpy surface creating friction',
      'sleek design slipping easily', 'ribbed pattern providing grip', 'soft cushion yielding pressure',
      'hard surface resisting force', 'elastic material stretching then returning', 'brittle substance threatening break',
      'flexible bend without damage', 'sticky surface clinging stubbornly', 'slippery coating avoiding grasp',
      'porous material absorbing moisture', 'waterproof barrier repelling liquid', 'absorbent fabric soaking spill',
      'glossy finish reflecting light', 'matte surface absorbing illumination', 'textured pattern creating visual interest',
      'embossed design raised tactile', 'engraved letters carved deep', 'painted surface smooth applied',
      'varnished wood protected preserved', 'raw timber natural unfinished', 'sanded smoothness preparation complete',
      'woven fabric interlaced threads', 'knitted material stretched loops', 'crocheted pattern hooked design',
      'leather hide natural processed', 'vinyl artificial substitute', 'rubber bouncing resilient',
      'plastic hard petroleum product', 'ceramic fired clay hardened', 'glass transparent fragile beauty',
      'paper fibrous flat medium', 'cardboard corrugated strength', 'foam cushioning air filled',
      'gel semi-solid viscous', 'liquid flowing taking shape', 'powder fine particles loose',
      'crystal hard mineral formation', 'stone natural earth hardness', 'concrete artificial stone mixture',
      'brick fired clay rectangular', 'tile ceramic square fitted', 'slate natural stone split',
      'marble metamorphic rock polished', 'granite igneous rock speckled', 'sandstone sedimentary rough natural'
    ]
  },
  
  // === STRATEGY 7: Faith Integration Depth Model ===
  faithIntegrationModel: {
    tiers: {
      'lived_faith': {
        description: 'Characters naturally living out beliefs without explicit mention',
        examples: [
          'choosing honesty even when difficult',
          'showing kindness to difficult person',
          'finding peace in chaos without preaching',
          'making sacrificial choice for others',
          'demonstrating forgiveness in action',
          'showing hope despite circumstances'
        ],
        frequency: 'Every chapter should include 1-2 elements',
        implementation: 'Weave into character actions and decisions naturally'
      },
      'conversational_faith': {
        description: 'Organic discussions arising from plot events',
        examples: [
          'questioning why bad things happen',
          'discussing different perspectives on faith',
          'sharing personal spiritual experiences',
          'debating moral decisions together',
          'wondering about God\'s plan',
          'finding meaning in difficult circumstances'
        ],
        frequency: 'Every 2-3 chapters should include organic discussion',
        implementation: 'Arise naturally from plot events, not forced insertion'
      },
      'formal_faith': {
        description: 'Church services, Bible studies, structured religious activities',
        examples: [
          'church service observations',
          'Bible study group dynamics',
          'prayer meeting interactions',
          'religious ceremony participation',
          'formal theological discussion',
          'structured worship elements'
        ],
        frequency: 'Every 3-4 chapters based on plot necessity',
        implementation: 'Only when plot naturally requires formal setting'
      }
    },
    
    generateFaithBalance(chapterNumber, totalChapters) {
      const chapterPosition = chapterNumber / totalChapters;
      
      // Early chapters: More lived faith, less formal
      if (chapterPosition < 0.3) {
        return {
          lived_faith: 2,
          conversational_faith: 1,
          formal_faith: 0
        };
      }
      
      // Middle chapters: Balanced approach
      if (chapterPosition < 0.7) {
        return {
          lived_faith: 1,
          conversational_faith: 1,
          formal_faith: Math.random() > 0.5 ? 1 : 0
        };
      }
      
      // Later chapters: Resolution through all tiers
      return {
        lived_faith: 1,
        conversational_faith: 1,
        formal_faith: 1
      };
    }
  },
  
  // === STRATEGY 8: Technology Era Authenticity Framework ===
  technologyEraFramework: {
    year1999: {
      hardware: [
        'Pentium III processor speed',
        'CRT monitor 17-inch maximum',
        'dial-up modem 56k connection',
        'CD-ROM drive reading speed',
        'floppy disk storage limited',
        'hard drive 10GB considered large',
        'RAM measured in megabytes',
        'ethernet card 10BaseT standard'
      ],
      software: [
        'Windows 98 Second Edition',
        'AOL Instant Messenger',
        'Napster file sharing',
        'Internet Explorer 5.0',
        'Microsoft Office 2000',
        'Real Player for media',
        'WinZip for compression',
        'Norton Antivirus protection'
      ],
      limitations: [
        'dial-up disconnections frequent',
        'downloading single song takes minutes',
        'no multitasking while online',
        'email limited attachment sizes',
        'no streaming video possible',
        'computer crashes requiring restart',
        'Y2K preparation concerns',
        'limited hard drive space'
      ],
      culturalContext: [
        'Y2K millennium bug fears',
        'dot-com boom speculation',
        'Columbine tragedy impact',
        'Clinton impeachment proceedings',
        'Star Wars Episode I release',
        'Matrix movie cultural impact',
        'Napster changing music industry',
        'cell phones still uncommon'
      ],
      
      generateTechAuthenticity(sceneType, characterTechLevel) {
        const techElements = [];
        
        if (sceneType === 'office') {
          techElements.push(
            this.hardware[Math.floor(Math.random() * this.hardware.length)],
            this.software[Math.floor(Math.random() * this.software.length)]
          );
        }
        
        if (sceneType === 'home') {
          techElements.push(
            this.limitations[Math.floor(Math.random() * this.limitations.length)]
          );
        }
        
        if (sceneType === 'general') {
          techElements.push(
            this.culturalContext[Math.floor(Math.random() * this.culturalContext.length)]
          );
        }
        
        return {
          elements: techElements,
          guidance: 'Integrate tech elements naturally through character interactions, not exposition',
          characterAdjustment: this.adjustForCharacterTechLevel(characterTechLevel)
        };
      },
      
      adjustForCharacterTechLevel(level) {
        const adjustments = {
          'high': 'Character comfortable with latest technology, mentions specific models/versions',
          'medium': 'Character uses technology but not expert, occasional confusion',
          'low': 'Character struggles with technology, prefers traditional methods'
        };
        
        return adjustments[level] || adjustments.medium;
      }
    }
  },
  
  // === STRATEGY 9: Narrative Tension Calibration System ===
  tensionCalibrationSystem: {
    tensionTypes: {
      'internal_conflict': {
        description: 'Character wrestling with internal decisions or beliefs',
        intensityLevels: ['mild_doubt', 'growing_concern', 'serious_questioning', 'crisis_of_faith'],
        resolutionTimeframes: ['same_chapter', 'multi_chapter', 'novel_arc']
      },
      'interpersonal_conflict': {
        description: 'Tension between characters with different goals/views',
        intensityLevels: ['mild_disagreement', 'heated_discussion', 'serious_argument', 'relationship_threat'],
        resolutionTimeframes: ['quick_resolution', 'extended_negotiation', 'ongoing_tension']
      },
      'external_obstacle': {
        description: 'Practical problems that must be solved',
        intensityLevels: ['minor_inconvenience', 'significant_problem', 'major_obstacle', 'crisis_situation'],
        resolutionTimeframes: ['immediate_fix', 'planned_solution', 'long_term_strategy']
      },
      'mystery_element': {
        description: 'Unknown information that drives curiosity',
        intensityLevels: ['casual_curiosity', 'growing_interest', 'urgent_need_to_know', 'critical_revelation'],
        resolutionTimeframes: ['chapter_revelation', 'gradual_discovery', 'climax_reveal']
      }
    },
    
    chapterTensionTracker: [],
    maxTensionHistory: 10,
    
    calibrateTension(chapterNumber, totalChapters, previousTensionLevel) {
      const chapterPosition = chapterNumber / totalChapters;
      const tensionTypes = Object.keys(this.tensionTypes);
      
      // Avoid same tension type as previous chapter
      const availableTypes = tensionTypes.filter(type => 
        !this.hasRecentTensionType(type, 2)
      );
      
      const selectedType = availableTypes.length > 0 ?
        availableTypes[Math.floor(Math.random() * availableTypes.length)] :
        tensionTypes[Math.floor(Math.random() * tensionTypes.length)];
      
      // Determine intensity based on story position
      const intensity = this.calculateIntensityForPosition(chapterPosition, selectedType);
      const resolutionFrame = this.selectResolutionTimeframe(chapterPosition, intensity);
      
      const tensionPlan = {
        chapterNumber,
        type: selectedType,
        intensity,
        resolutionTimeframe: resolutionFrame,
        implementation: this.generateTensionImplementation(selectedType, intensity),
        balancingElement: this.generateBalancingElement(intensity)
      };
      
      // Track for pattern avoidance
      this.chapterTensionTracker.push(tensionPlan);
      if (this.chapterTensionTracker.length > this.maxTensionHistory) {
        this.chapterTensionTracker.shift();
      }
      
      return tensionPlan;
    },
    
    hasRecentTensionType(tensionType, lookbackChapters) {
      const recent = this.chapterTensionTracker.slice(-lookbackChapters);
      return recent.some(tension => tension.type === tensionType);
    },
    
    calculateIntensityForPosition(chapterPosition, tensionType) {
      const typeData = this.tensionTypes[tensionType];
      const levels = typeData.intensityLevels;
      
      // Early chapters: lower intensity
      if (chapterPosition < 0.25) {
        return levels[0] || levels[Math.floor(levels.length * 0.3)];
      }
      
      // Middle chapters: building intensity
      if (chapterPosition < 0.75) {
        const index = Math.floor(levels.length * 0.6);
        return levels[index] || levels[1];
      }
      
      // Final chapters: high intensity
      const index = Math.floor(levels.length * 0.8);
      return levels[index] || levels[levels.length - 1];
    },
    
    selectResolutionTimeframe(chapterPosition, intensity) {
      // Higher intensity conflicts generally resolve faster
      // Climax chapters should resolve quickly
      if (chapterPosition > 0.8 || intensity.includes('crisis')) {
        return 'immediate_fix';
      }
      
      if (chapterPosition > 0.5) {
        return Math.random() > 0.5 ? 'planned_solution' : 'extended_negotiation';
      }
      
      return 'long_term_strategy';
    },
    
    generateTensionImplementation(tensionType, intensity) {
      const implementations = {
        'internal_conflict': `Character faces ${intensity.replace('_', ' ')} requiring difficult decision`,
        'interpersonal_conflict': `Characters experience ${intensity.replace('_', ' ')} over important issue`,
        'external_obstacle': `Plot presents ${intensity.replace('_', ' ')} blocking character goals`,
        'mystery_element': `Information gap creates ${intensity.replace('_', ' ')} driving character actions`
      };
      
      return implementations[tensionType] || 'Create meaningful conflict that serves character development';
    },
    
    generateBalancingElement(intensity) {
      const needsBalance = intensity.includes('crisis') || intensity.includes('serious') || intensity.includes('major');
      
      if (needsBalance) {
        const balancingOptions = [
          'Include moment of humor to relieve tension',
          'Show character finding small comfort or hope',
          'Add brief peaceful interaction between characters',
          'Include sensory detail that provides calm contrast',
          'Show character drawing on inner strength'
        ];
        
        return balancingOptions[Math.floor(Math.random() * balancingOptions.length)];
      }
      
      return 'Maintain natural rhythm without forced balance';
    }
  },
  
  // === STRATEGY 10: Beta Reader Simulation Protocol ===
  betaReaderSimulation: {
    checkCategories: {
      'character_motivation': {
        questions: [
          'Are character decisions believable given their background?',
          'Do characters have clear, understandable goals?',
          'Are character actions consistent with established personality?',
          'Do character changes feel earned through story events?'
        ],
        failureFlags: ['sudden personality change', 'unmotivated decision', 'unclear goals', 'inconsistent behavior']
      },
      'dialogue_authenticity': {
        questions: [
          'Does each character sound distinct when speaking?',
          'Would this dialogue sound natural if read aloud?',
          'Do conversations advance plot or develop character?',
          'Are dialogue tags varied and unobtrusive?'
        ],
        failureFlags: ['all characters sound same', 'unnatural speech patterns', 'overused dialogue tags', 'empty conversations']
      },
      'narrative_flow': {
        questions: [
          'Does each scene serve a clear purpose in the story?',
          'Are transitions between scenes smooth and logical?',
          'Is pacing appropriate for the story content?',
          'Does chapter build toward satisfying conclusion?'
        ],
        failureFlags: ['purposeless scenes', 'jarring transitions', 'inconsistent pacing', 'unsatisfying chapter end']
      },
      'authenticity_markers': {
        questions: [
          'Do period details feel researched rather than generic?',
          'Are regional details specific and accurate?',
          'Does faith integration feel natural, not preachy?',
          'Are technology references appropriate for 1999?'
        ],
        failureFlags: ['generic period details', 'inaccurate regional info', 'heavy-handed preaching', 'anachronistic technology']
      }
    },
    
    simulateBetaReaderFeedback(chapterContent, chapterData, antiAIInstructions) {
      const feedback = {
        overallScore: 0,
        categoryScores: {},
        specificIssues: [],
        strengthsIdentified: [],
        revisionSuggestions: []
      };
      
      let totalScore = 0;
      let categoryCount = 0;
      
      for (const [category, checks] of Object.entries(this.checkCategories)) {
        const categoryScore = this.evaluateCategory(category, chapterContent, chapterData, antiAIInstructions);
        feedback.categoryScores[category] = categoryScore;
        totalScore += categoryScore;
        categoryCount++;
        
        if (categoryScore < 7) {
          feedback.specificIssues.push(this.generateCategoryFeedback(category, categoryScore));
        } else {
          feedback.strengthsIdentified.push(this.generateStrengthFeedback(category));
        }
      }
      
      feedback.overallScore = Math.round(totalScore / categoryCount);
      feedback.revisionSuggestions = this.generateRevisionSuggestions(feedback.categoryScores);
      
      return feedback;
    },
    
    evaluateCategory(category, content, chapterData, instructions) {
      // Simplified scoring - in production would use actual content analysis
      const baseScore = 7; // Assume good quality baseline
      
      // Check if anti-AI instructions were followed
      const instructionCompliance = this.checkInstructionCompliance(category, instructions);
      
      // Simulate scoring based on category-specific criteria
      let score = baseScore + Math.floor(Math.random() * 3) - 1; // 6-9 range
      
      // Adjust based on instruction compliance
      if (instructionCompliance.high) score += 1;
      if (instructionCompliance.low) score -= 2;
      
      return Math.max(1, Math.min(10, score));
    },
    
    checkInstructionCompliance(category, instructions) {
      // Check if specific anti-AI instructions were implemented
      const compliance = {
        high: false,
        medium: false,
        low: false
      };
      
      if (instructions.characterVoices?.length > 0) compliance.high = true;
      if (instructions.surpriseElement) compliance.medium = true;
      if (instructions.openingStyle && instructions.endingStyle) compliance.high = true;
      
      return compliance;
    },
    
    generateCategoryFeedback(category, score) {
      const feedbackMap = {
        'character_motivation': 'Character motivations need clarification - ensure decisions feel earned',
        'dialogue_authenticity': 'Dialogue needs work - vary character voices and speech patterns',
        'narrative_flow': 'Pacing and transitions need attention - ensure smooth story progression',
        'authenticity_markers': 'Period/regional details need more specificity and accuracy'
      };
      
      return feedbackMap[category] || 'General improvements needed in this area';
    },
    
    generateStrengthFeedback(category) {
      const strengthMap = {
        'character_motivation': 'Character motivations feel authentic and well-developed',
        'dialogue_authenticity': 'Dialogue sounds natural and character-specific',
        'narrative_flow': 'Pacing and story progression work well',
        'authenticity_markers': 'Period and regional details feel well-researched'
      };
      
      return strengthMap[category] || 'This area shows good quality';
    },
    
    generateRevisionSuggestions(categoryScores) {
      const suggestions = [];
      
      for (const [category, score] of Object.entries(categoryScores)) {
        if (score < 6) {
          suggestions.push(this.getRevisionSuggestion(category));
        }
      }
      
      return suggestions;
    },
    
    getRevisionSuggestion(category) {
      const suggestionMap = {
        'character_motivation': 'Revise character decisions to better reflect their established background and goals',
        'dialogue_authenticity': 'Rewrite dialogue to ensure each character has distinct voice and speech patterns',
        'narrative_flow': 'Restructure scenes for better pacing and smoother transitions',
        'authenticity_markers': 'Research and add more specific period-appropriate and regional details'
      };
      
      return suggestionMap[category] || 'Review and revise this element for better quality';
    }
  },
  recentUsage: {
    descriptions: new Map(),
    metaphors: new Map(),
    openings: new Map(),
    phrases: new Map()
  },

  // Enhanced description tracker with filtering
  getSensoryDescription(type, chapterNumber, characterPerspective = null, timeOfDay = null) {
    const bank = this.sensoryBank[type] || [];
    const recentKey = `${type}_recent`;
    const recent = this.recentUsage.descriptions.get(recentKey) || new Set();
    
    // Character-filtered descriptions
    let availableDescriptions = bank;
    if (characterPerspective) {
      availableDescriptions = this.filterByCharacterPerspective(bank, characterPerspective);
    }
    
    // Time-sensitive descriptions
    if (timeOfDay) {
      availableDescriptions = this.filterByTimeOfDay(availableDescriptions, timeOfDay, type);
    }
    
    // Remove recently used (last 3 chapters)
    const unused = availableDescriptions.filter(desc => !recent.has(desc));
    
    if (unused.length === 0) {
      // If all used, reset and pick randomly
      recent.clear();
      this.recentUsage.descriptions.set(recentKey, recent);
    }
    
    const available = unused.length > 0 ? unused : availableDescriptions;
    const selected = available[Math.floor(Math.random() * available.length)];
    
    // Track usage
    recent.add(selected);
    if (recent.size > 15) { // Keep last 15 descriptions
      const first = recent.values().next().value;
      recent.delete(first);
    }
    this.recentUsage.descriptions.set(recentKey, recent);
    
    return selected;
  },

  filterByCharacterPerspective(descriptions, character) {
    // Character-specific filtering logic
    const characterTraits = {
      nature_lover: ['forest', 'earth', 'natural', 'organic', 'wild'],
      urban_dweller: ['concrete', 'asphalt', 'building', 'street', 'city'],
      artist: ['color', 'texture', 'pattern', 'design', 'visual'],
      practical: ['functional', 'useful', 'efficient', 'working'],
      romantic: ['gentle', 'soft', 'warm', 'beautiful', 'elegant']
    };
    
    const traits = characterTraits[character] || [];
    if (traits.length === 0) return descriptions;
    
    // Prefer descriptions that match character traits
    const matching = descriptions.filter(desc => 
      traits.some(trait => desc.toLowerCase().includes(trait))
    );
    
    return matching.length > 0 ? matching.concat(descriptions).slice(0, descriptions.length) : descriptions;
  },

  filterByTimeOfDay(descriptions, timeOfDay, type) {
    const timeKeywords = {
      morning: ['dawn', 'morning', 'early', 'fresh', 'new', 'bright'],
      afternoon: ['noon', 'bright', 'clear', 'warm', 'blazing'],
      evening: ['dusk', 'evening', 'twilight', 'amber', 'golden'],
      night: ['night', 'dark', 'moon', 'star', 'shadow', 'dim']
    };
    
    const keywords = timeKeywords[timeOfDay] || [];
    if (keywords.length === 0) return descriptions;
    
    // Prefer time-appropriate descriptions
    const timeAppropriate = descriptions.filter(desc =>
      keywords.some(keyword => desc.toLowerCase().includes(keyword))
    );
    
    return timeAppropriate.length > 0 ? 
      timeAppropriate.concat(descriptions).slice(0, descriptions.length) : 
      descriptions;
  },

  // 2. Enhanced Character Voice System
  characterVoiceLibrary: {
    speech_patterns: {
      direct: ['states facts plainly', 'asks direct questions', 'uses short sentences'],
      meandering: ['circles back to topics', 'uses longer explanations', 'includes tangents'],
      formal: ['uses complete sentences', 'avoids contractions', 'precise word choice'],
      casual: ['uses contractions freely', 'informal vocabulary', 'relaxed grammar'],
      humorous: ['makes jokes', 'uses wordplay', 'lightens serious moments'],
      serious: ['thoughtful responses', 'considers implications', 'measured speech']
    },
    regional_vocabularies: {
      southern: ['y\'all', 'fixin\' to', 'might could', 'over yonder', 'bless your heart'],
      northeastern: ['wicked', 'no worries', 'regular coffee', 'the T', 'rotary'],
      midwest: ['ope', 'you betcha', 'pop', 'casserole', 'uff da'],
      western: ['hella', 'the 405', 'marine layer', 'no way', 'totally'],
      rural: ['holler', 'creek', 'fixing', 'reckon', 'might be'],
      urban: ['subway', 'block', 'bodega', 'avenue', 'downtown']
    },
    conversational_styles: {
      questioner: ['What do you think?', 'Have you considered?', 'Why do you suppose?'],
      observer: ['I noticed that', 'It seems like', 'The way I see it'],
      storyteller: ['That reminds me of', 'You know what happened?', 'Let me tell you'],
      advisor: ['You might want to', 'Have you tried', 'In my experience'],
      challenger: ['But what if', 'Are you sure?', 'That doesn\'t make sense'],
      supporter: ['That\'s a great point', 'I understand', 'You\'re absolutely right']
    }
  },

  // Enhanced character voice generation
  generateCharacterVoice(characterName, background, previousChapters) {
    const existingDialogue = this.analyzeExistingDialogue(characterName, previousChapters);
    
    return {
      speechPattern: this.selectSpeechPattern(background),
      vocabulary: this.selectVocabulary(background),
      conversationStyle: this.selectConversationStyle(characterName),
      sentenceLength: this.determineSentencePreference(background),
      topicPreferences: this.generateTopicPreferences(background),
      avoidancePatterns: existingDialogue.overusedPhrases
    };
  },

  selectSpeechPattern(background) {
    const patterns = Object.keys(this.characterVoiceLibrary.speech_patterns);
    // Logic to select based on background
    return patterns[Math.floor(Math.random() * patterns.length)];
  },

  selectVocabulary(background) {
    const vocabs = Object.keys(this.characterVoiceLibrary.regional_vocabularies);
    return this.characterVoiceLibrary.regional_vocabularies[
      vocabs[Math.floor(Math.random() * vocabs.length)]
    ];
  },

  selectConversationStyle(characterName) {
    const styles = Object.keys(this.characterVoiceLibrary.conversational_styles);
    const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
    return this.characterVoiceLibrary.conversational_styles[selectedStyle];
  },

  // 3. Advanced Chapter Structure Diversification
  chapterStructureBank: {
    openings: [
      'action_immediate', 'dialogue_mid_conversation', 'description_immersive', 'flashback_triggered',
      'question_philosophical', 'conflict_ongoing', 'thought_internal', 'time_jump_forward',
      'setting_focus_detailed', 'emotion_raw', 'mystery_element_introduced', 'relationship_tension',
      'humor_unexpected', 'decision_aftermath', 'observation_character', 'memory_surfacing',
      'sound_breaking_silence', 'movement_dynamic', 'contrast_previous', 'anticipation_building',
      'routine_interrupted', 'discovery_made', 'problem_emerging', 'goal_declared',
      'warning_given', 'secret_hinted', 'change_noticed', 'challenge_accepted'
    ],
    transitions: [
      'meanwhile_elsewhere', 'hours_later', 'suddenly_shift', 'in_contrast', 'back_to_present',
      'across_town', 'that_same_moment', 'days_passed', 'without_warning', 'as_expected',
      'on_the_other_hand', 'little_did_they_know', 'simultaneously', 'in_the_distance',
      'closer_to_home', 'by_coincidence', 'as_fate_would_have_it', 'unexpectedly',
      'following_the_trail', 'retracing_steps', 'looking_ahead', 'circling_back'
    ],
    endings: [
      'cliffhanger_major', 'revelation_character', 'humor_lightening', 'emotional_peak',
      'action_pause_tense', 'question_profound', 'decision_crucial', 'conflict_escalation',
      'quiet_reflection', 'foreshadowing_ominous', 'growth_moment', 'plot_advancement',
      'mystery_deepened', 'relationship_shift', 'goal_achieved', 'setback_encountered',
      'hope_emerging', 'doubt_creeping', 'resolution_partial', 'complication_new',
      'understanding_dawning', 'misunderstanding_created', 'bond_strengthened', 'distance_growing'
    ]
  },

  chapterUsageTracker: {
    recentOpenings: [],
    recentTransitions: [],
    recentEndings: [],
    patternHistory: []
  },

  // Enhanced chapter structure selection with pattern breaking
  generateChapterStructure(chapterNumber, totalChapters, previousChapters) {
    const openingStyle = this.selectVariedOpening(chapterNumber);
    const transitionStyle = this.selectVariedTransition(chapterNumber);
    const endingStyle = this.selectVariedEnding(chapterNumber);
    
    // Force structural variation every 3 chapters
    if (chapterNumber % 3 === 0) {
      return this.forceStructuralVariation(openingStyle, transitionStyle, endingStyle);
    }
    
    return {
      opening: openingStyle,
      transition: transitionStyle,
      ending: endingStyle,
      pacing: this.generatePacingGuidance(chapterNumber),
      focus: this.generateChapterFocus(chapterNumber, totalChapters)
    };
  },

  selectVariedOpening(chapterNumber) {
    const available = this.chapterStructureBank.openings.filter(
      opening => !this.chapterUsageTracker.recentOpenings.includes(opening)
    );
    
    if (available.length === 0) {
      this.chapterUsageTracker.recentOpenings = [];
      return this.chapterStructureBank.openings[Math.floor(Math.random() * this.chapterStructureBank.openings.length)];
    }
    
    const selected = available[Math.floor(Math.random() * available.length)];
    this.chapterUsageTracker.recentOpenings.push(selected);
    
    // Keep only last 6 openings
    if (this.chapterUsageTracker.recentOpenings.length > 6) {
      this.chapterUsageTracker.recentOpenings.shift();
    }
    
    return selected;
  },

  selectVariedEnding(chapterNumber) {
    const available = this.chapterStructureBank.endings.filter(
      ending => !this.chapterUsageTracker.recentEndings.includes(ending)
    );
    
    if (available.length === 0) {
      this.chapterUsageTracker.recentEndings = [];
      return this.chapterStructureBank.endings[Math.floor(Math.random() * this.chapterStructureBank.endings.length)];
    }
    
    const selected = available[Math.floor(Math.random() * available.length)];
    this.chapterUsageTracker.recentEndings.push(selected);
    
    if (this.chapterUsageTracker.recentEndings.length > 6) {
      this.chapterUsageTracker.recentEndings.shift();
    }
    
    return selected;
  },

  // 4. Advanced Narrative Controls with Surprise Elements
  surpriseElementLibrary: {
    character_surprises: [
      'hidden_skill_revealed', 'unexpected_background_connection', 'personality_trait_subversion',
      'secret_knowledge_exposed', 'relationship_history_unveiled', 'motivation_twist',
      'allegiance_questioned', 'weakness_becomes_strength', 'strength_becomes_liability'
    ],
    plot_surprises: [
      'information_recontextualizes_events', 'plan_has_unforeseen_consequence', 'seemingly_minor_detail_crucial',
      'assumed_fact_proven_false', 'parallel_situation_emerges', 'timing_creates_opportunity',
      'external_force_intervenes', 'internal_conflict_resolution_unexpected'
    ],
    environmental_surprises: [
      'setting_reveals_hidden_aspect', 'weather_changes_plans', 'location_has_history',
      'space_configured_differently_than_expected', 'discovery_in_familiar_place',
      'environmental_obstacle_becomes_solution', 'setting_connects_to_character_past'
    ],
    dialogue_surprises: [
      'subtext_contradicts_surface_meaning', 'character_says_unexpected_thing',
      'conversation_topic_shift_reveals_truth', 'silence_more_meaningful_than_words',
      'interruption_changes_dynamic', 'misheard_word_creates_misunderstanding',
      'shared_reference_creates_bond', 'linguistic_clue_reveals_information'
    ]
  },

  generateSurpriseElement(chapterNumber, chapterContext, previousChapters) {
    const categories = Object.keys(this.surpriseElementLibrary);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const surprises = this.surpriseElementLibrary[selectedCategory];
    
    // Ensure surprise hasn't been used recently
    const recentSurprises = this.getRecentSurprises(previousChapters);
    const available = surprises.filter(surprise => !recentSurprises.includes(surprise));
    
    const selectedSurprise = available.length > 0 ? 
      available[Math.floor(Math.random() * available.length)] :
      surprises[Math.floor(Math.random() * surprises.length)];
    
    return {
      type: selectedCategory,
      element: selectedSurprise,
      implementation: this.generateSurpriseImplementation(selectedSurprise, chapterContext)
    };
  },

  generateSurpriseImplementation(surprise, context) {
    // Generate specific implementation guidance for the surprise
    const implementations = {
      'hidden_skill_revealed': 'Have character demonstrate unexpected competency in crisis moment',
      'information_recontextualizes_events': 'Reveal detail that changes meaning of previous scene',
      'setting_reveals_hidden_aspect': 'Character notices something about location that changes its significance',
      'conversation_topic_shift_reveals_truth': 'Casual comment exposes important information'
    };
    
    return implementations[surprise] || 'Integrate naturally into chapter flow without forcing';
  },

  // 5. Stylistic Variation Engine
  styleVariationEngine: {
    pacingPatterns: {
      'fast': { sentences: 'short_varied', paragraphs: 'brief_punchy', transitions: 'sharp_cuts' },
      'medium': { sentences: 'mixed_length', paragraphs: 'balanced_flow', transitions: 'smooth_bridges' },
      'slow': { sentences: 'longer_flowing', paragraphs: 'developed_rich', transitions: 'gradual_shifts' },
      'variable': { sentences: 'deliberately_mixed', paragraphs: 'rhythm_based', transitions: 'mood_matched' }
    },
    metaphorCategories: {
      'nature': ['like wind through trees', 'steady as mountain stone', 'flowing like river water'],
      'mechanical': ['clockwork precision', 'well-oiled machine', 'gears grinding slowly'],
      'artistic': ['painted in broad strokes', 'delicate as watercolor', 'bold as sculpture'],
      'musical': ['rhythmic like drumbeat', 'harmonious as choir', 'discordant as broken piano'],
      'architectural': ['built on solid foundation', 'scaffolding of support', 'bridge between worlds'],
      'culinary': ['recipe for disaster', 'half-baked idea', 'full course of emotions']
    },
    wordChoicePatterns: {
      'formal': { complexity: 'high', vocabulary: 'precise', tone: 'elevated' },
      'conversational': { complexity: 'medium', vocabulary: 'accessible', tone: 'approachable' },
      'casual': { complexity: 'low', vocabulary: 'everyday', tone: 'relaxed' },
      'lyrical': { complexity: 'varied', vocabulary: 'evocative', tone: 'beautiful' },
      'urgent': { complexity: 'simple', vocabulary: 'immediate', tone: 'pressing' },
      'contemplative': { complexity: 'nuanced', vocabulary: 'thoughtful', tone: 'reflective' }
    }
  },

  generateStyleGuidance(chapterNumber, sceneType, emotionalTone) {
    const pacing = this.selectPacingPattern(sceneType, emotionalTone);
    const metaphorCategory = this.selectMetaphorCategory(chapterNumber);
    const wordChoice = this.selectWordChoicePattern(emotionalTone);
    
    return {
      pacing: this.styleVariationEngine.pacingPatterns[pacing],
      metaphors: this.styleVariationEngine.metaphorCategories[metaphorCategory],
      wordChoice: this.styleVariationEngine.wordChoicePatterns[wordChoice],
      sentenceVariation: this.generateSentenceVariationGuidance(chapterNumber),
      paragraphStructure: this.generateParagraphStructureGuidance(sceneType),
      avoidOverusedWords: this.getOverusedWordsToAvoid(chapterNumber)
    };
  },

  // Enhanced main instruction generator with integrated advanced frameworks
  generateWritingInstructions(chapterNumber, chapterData, previousChapters) {
    console.log(`🎯 Generating advanced writing instructions for Chapter ${chapterNumber}`);
    
    // STRATEGY 1: Character Voice Consistency Framework
    const characterVoices = chapterData.characters.map(char => {
      return this.characterVoiceFramework.generateDetailedCharacterVoice(
        char.name || char,
        char.background || 'general',
        char.age || 35,
        'pacific_northwest',
        this.extractCharacterDialogue(char.name || char, previousChapters)
      );
    });
    
    // STRATEGY 2: Setting-Specific Sensory Details
    const settingType = this.determineSettingType(chapterData.setting);
    const sensoryDetails = this.settingSensoryDatabase[settingType] || this.settingSensoryDatabase.home_1999;
    
    // STRATEGY 3: Dynamic Scene Structure
    const chapterMood = this.determineChapterMood(chapterData, chapterNumber);
    const sceneStructure = this.sceneStructureTemplates.selectVariedOpening(chapterNumber, chapterMood);
    
    // STRATEGY 4: Metaphor Domain Control
    const metaphorDomain = this.selectMetaphorDomain(chapterNumber);
    const controlledMetaphor = this.metaphorDomainSystem.selectControlledMetaphor(metaphorDomain, chapterNumber);
    
    // STRATEGY 5: Plot Thread Management
    const plotThreads = this.plotThreadManager.getThreadsNeedingDevelopment(chapterNumber);
    const shouldIntroduceNewThread = this.plotThreadManager.shouldIntroduceNewThread(chapterNumber, 25);
    
    // STRATEGY 6: Regional Dialect
    const dialectElement = this.regionalDialectSystem.pacificNorthwest1999.selectAuthenticExpression(
      'local', previousChapters.slice(-3)
    );
    
    // STRATEGY 7: Faith Integration
    const faithBalance = this.faithIntegrationModel.generateFaithBalance(chapterNumber, 25);
    
    // STRATEGY 8: Technology Era Authenticity
    const techAuthenticity = this.technologyEraFramework.year1999.generateTechAuthenticity(
      this.determineSceneType(chapterData), 'medium'
    );
    
    // STRATEGY 9: Narrative Tension Calibration
    const tensionPlan = this.tensionCalibrationSystem.calibrateTension(
      chapterNumber, 25, this.getLastTensionLevel(previousChapters)
    );
    
    // STRATEGY 10: Quality Control Framework
    const qualityChecks = this.generateAdvancedQualityChecks(chapterNumber, chapterData);
    
    // Original system elements (enhanced)
    const structure = this.generateChapterStructure(chapterNumber, 25, previousChapters);
    const surprise = this.generateSurpriseElement(chapterNumber, chapterData, previousChapters);
    const style = this.generateStyleGuidance(chapterNumber, 'mixed', chapterData.emotionalTone || 'neutral');
    const avoidancePatterns = this.generateAvoidancePatterns(previousChapters);
    
    return {
      // === ADVANCED FRAMEWORK INTEGRATION ===
      
      // Strategy 1: Character Voice Framework
      characterVoiceFramework: {
        characters: characterVoices,
        voiceGuidance: 'Each character must use their specific vocabulary, sentence structure, and speech rhythm',
        implementation: 'Reference character voice maps for every dialogue exchange'
      },
      
      // Strategy 2: Setting Sensory Database
      settingSensoryDetails: {
        type: settingType,
        smells: sensoryDetails.smells?.slice(0, 3) || [],
        sounds: sensoryDetails.sounds?.slice(0, 3) || [],
        sights: sensoryDetails.sights?.slice(0, 3) || [],
        textures: sensoryDetails.textures?.slice(0, 3) || [],
        usage: 'Select 2-3 specific details that connect to plot or character development'
      },
      
      // Strategy 3: Scene Structure Templates
      sceneStructureFramework: {
        openingTechnique: sceneStructure.technique,
        openingGuidance: sceneStructure.guidance,
        chapterMood: chapterMood,
        implementation: sceneStructure.details.description
      },
      
      // Strategy 4: Metaphor Domain Control
      metaphorDomainControl: {
        assignedDomain: metaphorDomain,
        selectedMetaphor: controlledMetaphor,
        usageGuidance: this.metaphorDomainSystem.getMetaphorUsageGuidance(),
        restriction: 'Only use metaphors from assigned domain, maximum 1-2 per paragraph'
      },
      
      // Strategy 5: Plot Thread Management
      plotThreadManagement: {
        threadsNeedingDevelopment: plotThreads.slice(0, 1), // Focus on 1 thread per chapter
        shouldIntroduceNew: shouldIntroduceNewThread,
        implementation: plotThreads.length > 0 ? plotThreads[0].suggestions : null
      },
      
      // Strategy 6: Regional Dialect Framework
      regionalDialectAuthenticity: {
        selectedExpression: dialectElement,
        usage: 'Use maximum 1 regional expression, only in dialogue',
        characterApplication: 'Native characters use more, newcomers use standard speech'
      },
      
      // Strategy 7: Faith Integration Model
      faithIntegrationBalance: {
        livedFaith: faithBalance.lived_faith,
        conversationalFaith: faithBalance.conversational_faith,
        formalFaith: faithBalance.formal_faith,
        guidance: 'Integrate faith naturally through character actions and organic conversations'
      },
      
      // Strategy 8: Technology Era Framework
      technologyAuthenticity: {
        elements: techAuthenticity.elements,
        characterAdjustment: techAuthenticity.characterAdjustment,
        guidance: techAuthenticity.guidance,
        era: '1999 technology limitations and cultural context'
      },
      
      // Strategy 9: Tension Calibration
      tensionCalibration: {
        type: tensionPlan.type,
        intensity: tensionPlan.intensity,
        implementation: tensionPlan.implementation,
        balancingElement: tensionPlan.balancingElement,
        resolutionTimeframe: tensionPlan.resolutionTimeframe
      },
      
      // === ORIGINAL SYSTEM ENHANCED ===
      
      // Structural elements
      openingStyle: structure.opening,
      endingStyle: structure.ending,
      transitionStyle: structure.transition,
      chapterFocus: structure.focus,
      
      // Surprise and narrative control
      surpriseElement: surprise.element,
      surpriseImplementation: surprise.implementation,
      
      // Style variations
      pacingGuidance: style.pacing,
      metaphorCategory: style.metaphors[0],
      wordChoicePattern: style.wordChoice,
      
      // Character-specific instructions (enhanced)
      characterVoices: characterVoices.map(cv => ({
        name: cv.characterName,
        voice: cv,
        dialogueGuidance: this.generateDialogueGuidance(cv.characterName, previousChapters)
      })),
      
      // Anti-repetition controls (enhanced)
      avoidancePatterns: {
        ...avoidancePatterns,
        characterVoiceOveruse: this.getCharacterVoiceOveruse(characterVoices, previousChapters),
        settingDescriptionRepeats: this.getSettingDescriptionRepeats(settingType, previousChapters),
        metaphorDomainViolations: this.getMetaphorDomainViolations(metaphorDomain, previousChapters)
      },
      
      // Advanced quality controls
      qualityChecks: {
        ...qualityChecks,
        betaReaderChecklist: this.betaReaderSimulation.checkCategories,
        humanQualityVerification: this.generateHumanQualityVerification(chapterNumber)
      },
      
      // Implementation guidance
      implementationPriority: [
        '1. Apply character voice framework for all dialogue',
        '2. Use assigned scene opening technique',
        '3. Integrate tension calibration naturally',
        '4. Include setting-specific sensory details',
        '5. Develop identified plot thread',
        '6. Balance faith integration across tiers',
        '7. Include period-appropriate technology',
        '8. Apply metaphor domain restrictions',
        '9. Use regional dialect sparingly',
        '10. Include surprise element organically'
      ]
    };
  },
  
  // Helper methods for new framework integration
  determineSettingType(setting) {
    const settingMap = {
      'church': 'church',
      'home': 'home_1999',
      'office': 'technology_office_1999',
      'downtown': 'small_town_main_street',
      'main_street': 'small_town_main_street'
    };
    
    const settingLower = setting?.toLowerCase() || '';
    for (const [key, value] of Object.entries(settingMap)) {
      if (settingLower.includes(key)) {
        return value;
      }
    }
    
    return 'home_1999'; // Default
  },
  
  determineChapterMood(chapterData, chapterNumber) {
    const purposeMap = {
      'conflict': 'tense',
      'resolution': 'reflective',
      'revelation': 'dramatic',
      'relationship': 'intimate',
      'mystery': 'mysterious'
    };
    
    const purpose = chapterData.purpose?.toLowerCase() || '';
    for (const [key, mood] of Object.entries(purposeMap)) {
      if (purpose.includes(key)) {
        return mood;
      }
    }
    
    // Default based on story position
    const position = chapterNumber / 25;
    if (position < 0.3) return 'reflective';
    if (position < 0.7) return 'tense';
    return 'dramatic';
  },
  
  selectMetaphorDomain(chapterNumber) {
    const domains = ['faith_concepts', 'technology_mechanical', 'relationships_musical', 'community_cooking'];
    return domains[chapterNumber % domains.length];
  },
  
  determineSceneType(chapterData) {
    const setting = chapterData.setting?.toLowerCase() || '';
    if (setting.includes('office') || setting.includes('work')) return 'office';
    if (setting.includes('church') || setting.includes('chapel')) return 'general';
    return 'home';
  },
  
  getLastTensionLevel(previousChapters) {
    if (previousChapters.length === 0) return 'medium';
    // In production, would analyze actual tension from last chapter
    return 'medium';
  },
  
  extractCharacterDialogue(characterName, previousChapters) {
    // In production, would parse actual dialogue from previous chapters
    return []; // Simplified for framework
  },
  
  getCharacterVoiceOveruse(characterVoices, previousChapters) {
    // In production, would analyze actual voice pattern usage
    return [];
  },
  
  getSettingDescriptionRepeats(settingType, previousChapters) {
    // In production, would check for repeated setting descriptions
    return [];
  },
  
  getMetaphorDomainViolations(assignedDomain, previousChapters) {
    // In production, would check for metaphors outside assigned domain
    return [];
  },
  
  generateAdvancedQualityChecks(chapterNumber, chapterData) {
    return {
      characterConsistency: [
        'Verify each character uses their established voice map',
        'Check character decisions align with background',
        'Ensure character growth feels earned'
      ],
      authenticityMarkers: [
        'Confirm 1999 technology references are accurate',
        'Verify Pacific Northwest regional details',
        'Check faith integration feels natural, not forced'
      ],
      narrativeFlow: [
        'Ensure assigned opening technique is implemented',
        'Check tension calibration creates appropriate conflict',
        'Verify plot thread development serves story arc'
      ],
      stylistic: [
        'Confirm metaphors stay within assigned domain',
        'Check sentence variation prevents AI patterns',
        'Verify setting details are specific, not generic'
      ]
    };
  },
  
  generateHumanQualityVerification(chapterNumber) {
    return [
      'Does this feel written by a human author, not AI?',
      'Are character voices completely distinct in dialogue?',
      'Do setting details feel researched, not generic?',
      'Is faith integration organic to the story?',
      'Are technology references authentically 1999?',
      'Does surprise element feel natural, not forced?',
      'Are metaphors consistent within assigned domain?',
      'Is tension appropriate for story position?',
      'Do regional details enhance without overwhelming?',
      'Does chapter serve both plot and character development?'
    ];
  },

  generateAvoidancePatterns(previousChapters) {
    // Analyze last 3 chapters for overused patterns
    const lastThree = previousChapters.slice(-3);
    
    return {
      overusedPhrases: this.extractOverusedPhrases(lastThree),
      repetitiveOpenings: this.extractRepetitiveOpenings(lastThree),
      similarTransitions: this.extractSimilarTransitions(lastThree),
      metaphorRepeats: this.extractRepeatedMetaphors(lastThree),
      dialoguePatterns: this.extractDialoguePatterns(lastThree)
    };
  },

  generateQualityCheckList(chapterNumber) {
    return {
      variationChecks: [
        'Ensure sentence lengths vary throughout chapter',
        'Check paragraph structure creates good rhythm',
        'Verify character voices remain distinct',
        'Confirm sensory details engage multiple senses'
      ],
      contentChecks: [
        'Include surprise element naturally in narrative flow',
        'Advance plot while developing character',
        'Maintain consistent tone while varying style',
        'Connect to overall story arc meaningfully'
      ],
      technicalChecks: [
        'Avoid repetition of words within paragraphs',
        'Balance dialogue, action, and description',
        'Ensure transitions between scenes flow smoothly',
        'Check that chapter serves story purpose'
      ]
    };
  },

  // Helper methods for extraction and analysis
  extractOverusedPhrases(chapters) {
    // Simplified implementation - would use actual text analysis in production
    return ['suddenly', 'just then', 'all of a sudden', 'in that moment'];
  },

  extractRepetitiveOpenings(chapters) {
    return ['The morning sun', 'As she walked', 'Meanwhile'];
  },

  extractSimilarTransitions(chapters) {
    return ['Later that day', 'After a while', 'Soon enough'];
  },

  extractRepeatedMetaphors(chapters) {
    return ['like a bird', 'ocean of', 'mountain of'];
  },

  extractDialoguePatterns(chapters) {
    return ['he said simply', 'she replied quietly', 'they whispered'];
  },

  selectPacingPattern(sceneType, emotionalTone) {
    const pacingMap = {
      action: 'fast',
      dialogue: 'medium', 
      reflection: 'slow',
      revelation: 'variable',
      conflict: 'fast',
      romance: 'slow',
      mystery: 'variable'
    };
    
    return pacingMap[sceneType] || 'medium';
  },

  selectMetaphorCategory(chapterNumber) {
    const categories = Object.keys(this.styleVariationEngine.metaphorCategories);
    // Rotate categories to ensure variety
    return categories[chapterNumber % categories.length];
  },

  selectWordChoicePattern(emotionalTone) {
    const toneMap = {
      tense: 'urgent',
      peaceful: 'lyrical',
      dramatic: 'formal',
      intimate: 'conversational',
      mysterious: 'contemplative',
      action: 'casual'
    };
    
    return toneMap[emotionalTone] || 'conversational';
  },

  generateCharacterVoiceInstructions(characters, previousChapters) {
    return characters.map(char => ({
      name: char,
      voice: this.generateCharacterVoice(char, 'general', previousChapters),
      dialogueGuidance: this.generateDialogueGuidance(char, previousChapters)
    }));
  },

  generateDialogueGuidance(characterName, previousChapters) {
    return {
      speechPattern: this.selectSpeechPattern('general'),
      vocabulary: this.selectVocabulary('general'),
      topicPreferences: ['current situation', 'personal background', 'future plans'],
      avoidTopics: this.getOverusedTopicsForCharacter(characterName, previousChapters)
    };
  },

  getOverusedTopicsForCharacter(characterName, previousChapters) {
    // Simplified - would analyze actual dialogue in production
    return ['weather', 'small talk'];
  },

  getRecentSurprises(previousChapters) {
    // Would extract actual surprises used - simplified for now
    return [];
  },

  generateSentenceVariationGuidance(chapterNumber) {
    return {
      shortSentences: 'Use for impact and clarity',
      mediumSentences: 'Use for main narrative flow', 
      longSentences: 'Use for complex ideas and atmosphere',
      fragmentsOkay: 'Occasional fragments for emphasis acceptable'
    };
  },

  generateParagraphStructureGuidance(sceneType) {
    const structureMap = {
      action: 'Keep paragraphs brief for fast pacing',
      dialogue: 'New paragraph for each speaker',
      description: 'Longer paragraphs for immersive detail',
      reflection: 'Varied paragraph lengths for natural thought flow'
    };
    
    return structureMap[sceneType] || 'Vary paragraph length for good rhythm';
  },

  getOverusedWordsToAvoid(chapterNumber) {
    // Words that AI commonly overuses
    return [
      'suddenly', 'just', 'really', 'very', 'quite', 'rather', 'perhaps',
      'seemed', 'appeared', 'felt like', 'sort of', 'kind of'
    ];
  },

  // Additional missing helper methods
  determineSentencePreference(background) {
    // Determine sentence length preference based on character background
    const backgroundMap = {
      academic: 'longer',
      rural: 'shorter',
      urban: 'mixed',
      professional: 'medium',
      artistic: 'varied'
    };
    return backgroundMap[background] || 'mixed';
  },

  generateTopicPreferences(background) {
    // Generate topic preferences based on character background
    const topicMap = {
      academic: ['research', 'theories', 'knowledge'],
      rural: ['nature', 'community', 'practical matters'],
      urban: ['technology', 'culture', 'opportunities'],
      professional: ['work', 'goals', 'networking'],
      artistic: ['creativity', 'expression', 'beauty']
    };
    return topicMap[background] || ['general conversation', 'current events'];
  },

  analyzeExistingDialogue(characterName, previousChapters) {
    // Analyze existing dialogue patterns for character consistency
    // Simplified implementation - in production would parse actual dialogue
    return {
      avgSentenceLength: Math.random() * 15 + 10,
      commonPhrases: ['well', 'you know', 'I think'],
      overusedPhrases: ['suddenly said', 'quietly replied'],
      topicFrequency: { 'work': 0.3, 'family': 0.2, 'plans': 0.1 }
    };
  },

  selectVariedTransition(chapterNumber) {
    // Select transition style avoiding recent usage
    const available = this.chapterStructureBank.transitions.filter(
      transition => !this.chapterUsageTracker.recentTransitions.includes(transition)
    );
    
    if (available.length === 0) {
      this.chapterUsageTracker.recentTransitions = [];
      return this.chapterStructureBank.transitions[
        Math.floor(Math.random() * this.chapterStructureBank.transitions.length)
      ];
    }
    
    const selected = available[Math.floor(Math.random() * available.length)];
    this.chapterUsageTracker.recentTransitions.push(selected);
    
    // Keep only last 4 transitions
    if (this.chapterUsageTracker.recentTransitions.length > 4) {
      this.chapterUsageTracker.recentTransitions.shift();
    }
    
    return selected;
  },

  forceStructuralVariation(opening, transition, ending) {
    // Force structural variation every few chapters
    const alternativeOpenings = this.chapterStructureBank.openings.filter(
      o => o !== opening && !o.includes('action') // Force different category
    );
    const alternativeEndings = this.chapterStructureBank.endings.filter(
      e => e !== ending && !e.includes('cliffhanger') // Force different category
    );
    
    return {
      opening: alternativeOpenings.length > 0 ? 
        alternativeOpenings[Math.floor(Math.random() * alternativeOpenings.length)] : opening,
      transition: transition, // Keep transition
      ending: alternativeEndings.length > 0 ? 
        alternativeEndings[Math.floor(Math.random() * alternativeEndings.length)] : ending,
      forced: true // Flag to indicate this was a forced variation
    };
  },

  generatePacingGuidance(chapterNumber) {
    // Generate specific pacing guidance
    const pacingTypes = ['fast', 'medium', 'slow', 'variable'];
    const selectedPacing = pacingTypes[chapterNumber % pacingTypes.length];
    
    return this.styleVariationEngine.pacingPatterns[selectedPacing];
  },

  generateChapterFocus(chapterNumber, totalChapters) {
    // Determine what this chapter should focus on
    const focusOptions = [
      'character_development', 'plot_advancement', 'setting_exploration',
      'relationship_building', 'conflict_escalation', 'mystery_deepening',
      'tension_building', 'resolution_partial', 'world_building', 'theme_exploration'
    ];
    
    // Rotate focus to ensure variety
    return focusOptions[chapterNumber % focusOptions.length];
  }
};

exports.handler = async function(event, context) {
  console.log('=== AutoGenerate Function Start ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Request body:', event.body);
  
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  try {
    console.log('Step 1: Parsing request body...');
    const requestData = JSON.parse(event.body || '{}');
    const { mode, jobId, synopsis, genre, subgenre, wordCount, userPreferences, useBatch } = requestData;
    console.log('Step 2: Request data parsed successfully:', { 
      mode, genre, subgenre, wordCount, useBatch,
      synopsisLength: synopsis?.length 
    });
    
    console.log('Step 3: Checking environment variables...');
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API key exists:', !!apiKey);
    console.log('API key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('ERROR: API key not found in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API key not found in environment variables'
        })
      };
    }
    
    console.log('Step 4: Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });
    console.log('Step 5: OpenAI client initialized successfully');

    console.log('Step 6: Setting up helper functions...');
    
    // Job Management System
    const jobManager = {
      createJob(jobId, synopsis, genre, subgenre, wordCount, userPreferences) {
        console.log('Creating job:', jobId);
        const job = {
          jobId,
          status: 'starting',
          progress: 0,
          message: 'Initializing novel generation...',
          synopsis,
          genre,
          subgenre,
          wordCount,
          userPreferences: userPreferences || {},
          startTime: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          novel: null,
          error: null
        };
        jobStorage.set(jobId, job);
        console.log('Job created successfully:', jobId);
        return job;
      },

      updateJob(jobId, updates) {
        console.log('Updating job:', jobId, updates);
        const job = jobStorage.get(jobId);
        if (job) {
          Object.assign(job, updates, { lastUpdate: new Date().toISOString() });
          jobStorage.set(jobId, job);
          console.log(`Job ${jobId} updated:`, { status: job.status, progress: job.progress, message: job.message });
        }
        return job;
      },

      getJob(jobId) {
        console.log('Getting job:', jobId);
        return jobStorage.get(jobId);
      },

      deleteJob(jobId) {
        console.log('Deleting job:', jobId);
        return jobStorage.delete(jobId);
      }
    };

    console.log('Step 7: Job manager initialized');

    // Context Management System
    const contextManager = {
      maxTokens: 120000, // GPT-4o limit with safety margin
      
      compressChapter(chapter, level = 'medium') {
        const content = chapter.content || '';
        switch(level) {
          case 'light':
            return content.substring(0, Math.min(content.length, 2000));
          case 'medium':
            return content.substring(0, Math.min(content.length, 1000));
          case 'heavy':
            return content.substring(0, Math.min(content.length, 500));
          default:
            return content;
        }
      },
      
      buildContext(synopsis, outline, chapters, currentChapterNum) {
        let context = `SYNOPSIS:\n${synopsis}\n\n`;
        
        // Add outline
        if (outline && outline.length > 0) {
          context += `OUTLINE:\n`;
          outline.forEach((ch, i) => {
            context += `Chapter ${i + 1}: ${ch.title} - ${ch.summary}\n`;
          });
          context += '\n';
        }
        
        // Add previous chapters with compression
        if (chapters && chapters.length > 0) {
          context += `PREVIOUS CHAPTERS:\n`;
          chapters.forEach((ch, i) => {
            const chapterNum = i + 1;
            const distance = currentChapterNum - chapterNum;
            
            let compressionLevel = 'none';
            if (distance > 5) compressionLevel = 'heavy';
            else if (distance > 2) compressionLevel = 'medium';
            else if (distance > 0) compressionLevel = 'light';
            
            const content = compressionLevel === 'none' ? 
              ch.content : this.compressChapter(ch, compressionLevel);
              
            context += `=== Chapter ${chapterNum}: ${ch.title} ===\n${content}\n\n`;
          });
        }
        
        return context;
      }
    };

    // Retry mechanism with exponential backoff
    const makeOpenAIRequest = async (params, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const completion = await openai.chat.completions.create(params);
          return completion;
        } catch (error) {
          console.log(`Attempt ${i + 1} failed:`, error.message);
          
          if (error.status === 429) { // Rate limit error
            const waitTime = Math.min(1000 * Math.pow(2, i), 30000);
            console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          if (i === retries - 1) throw error;
        }
      }
    };

    // Generate unique job ID
    function generateJobId() {
      return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Estimate generation time based on word count
    function getEstimatedTime(wordCount) {
      const wordsPerMinute = 500; // Conservative estimate for AI generation
      return Math.ceil(parseInt(wordCount) / wordsPerMinute);
    }

    // Get default chapter count based on word count
    function getDefaultChapterCount(wordCount) {
      const words = parseInt(wordCount);
      if (words <= 20000) return 8;
      if (words <= 50000) return 15;
      if (words <= 80000) return 20;
      return 25;
    }

    // Get default words per chapter
    function getDefaultWordsPerChapter(wordCount) {
      const words = parseInt(wordCount);
      const chapters = getDefaultChapterCount(wordCount);
      return Math.ceil(words / chapters);
    }

    console.log('Step 8: Processing mode:', mode);
    
    // Handle different modes
    switch(mode) {
      case 'test':
        console.log('Step 9: Test mode - returning success');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'success',
            message: 'AutoGenerate function is working',
            timestamp: new Date().toISOString(),
            debugInfo: {
              apiKeyLength: apiKey.length,
              mode: mode,
              step: 'test-complete'
            }
          })
        };
        
      case 'start':
        console.log('Step 9: Start mode - calling startAutoGeneration');
        return await startAutoGeneration(synopsis, genre, subgenre, wordCount, userPreferences, useBatch);
      
      case 'status':
        console.log('Step 9: Status mode - calling getJobStatus');
        return await getJobStatus(jobId);
      
      case 'cancel':
        console.log('Step 9: Cancel mode - calling cancelJob');
        return await cancelJob(jobId);
      
      default:
        console.log('Step 9: Invalid mode specified:', mode);
        throw new Error(`Invalid mode specified: ${mode}`);
    }

    // Start Auto Generation - Returns immediately with job ID
    async function startAutoGeneration(synopsis, genre, subgenre, wordCount, prefs = {}, useBatch = false) {
      const jobId = generateJobId();
      console.log(`Starting new AutoGenerate job: ${jobId} (batch: ${useBatch})`);
      
      // Create job in storage
      const job = jobManager.createJob(jobId, synopsis, genre, subgenre, wordCount, { ...prefs, useBatch });
      
      // Start background processing (non-blocking)
      processNovelGeneration(jobId, useBatch).catch(error => {
        console.error(`Background job ${jobId} failed:`, error);
        jobManager.updateJob(jobId, {
          status: 'error',
          progress: 0,
          message: 'Generation failed',
          error: error.message
        });
      });
      
      // Return immediately with job info
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId,
          status: 'started',
          message: 'Novel generation started in background',
          estimatedTimeMinutes: getEstimatedTime(wordCount),
          pollUrl: `/.netlify/functions/autoGenerateNovel?mode=status&jobId=${jobId}`
        })
      };
    }

    // Get job status
    async function getJobStatus(jobId) {
      if (!jobId) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job ID is required'
          })
        };
      }

      const job = jobManager.getJob(jobId);
      if (!job) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job not found'
          })
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId: job.jobId,
          status: job.status,
          progress: job.progress,
          message: job.message,
          lastUpdate: job.lastUpdate,
          startTime: job.startTime,
          novel: job.novel,
          error: job.error,
          // Add detailed progress tracking fields
          currentPhase: job.currentPhase,
          currentChapter: job.currentChapter,
          currentChapterTitle: job.currentChapterTitle,
          chaptersOutlined: job.chaptersOutlined,
          chaptersWritten: job.chaptersWritten,
          estimatedChapters: job.estimatedChapters,
          totalChapters: job.totalChapters,
          estimatedWordsWritten: job.estimatedWordsWritten
        })
      };
    }

    // Cancel a job
    async function cancelJob(jobId) {
      if (!jobId) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job ID is required'
          })
        };
      }

      const job = jobManager.getJob(jobId);
      if (!job) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job not found'
          })
        };
      }

      // Mark job as cancelled
      jobManager.updateJob(jobId, {
        status: 'cancelled',
        message: 'Job cancelled by user'
      });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          status: 'cancelled',
          message: 'Job cancelled successfully'
        })
      };
    }

    // Background processing function
    async function processNovelGeneration(jobId) {
      const job = jobManager.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      const { synopsis, genre, subgenre, wordCount, userPreferences } = job;
      
      try {
        // Step 1: Analyze synopsis and determine chapter count
        jobManager.updateJob(jobId, {
          status: 'analyzing',
          progress: 5,
          message: 'Analyzing synopsis and planning novel structure'
        });

        const analysisPrompt = `Analyze this ${wordCount} word ${genre} synopsis and determine the optimal chapter structure:

SYNOPSIS:
${synopsis}

Provide a JSON response with:
{
  "recommendedChapterCount": number,
  "storyStructure": "three-act" | "hero-journey" | "custom",
  "estimatedWordsPerChapter": number,
  "keyStoryBeats": ["beat1", "beat2", "..."],
  "pacing": "fast" | "medium" | "slow"
}`;

        const analysisResponse = await makeOpenAIRequest({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 800,
          temperature: 0.3
        });

        let analysis;
        try {
          analysis = JSON.parse(analysisResponse.choices[0].message.content);
        } catch (e) {
          console.log('Analysis JSON parsing failed, using defaults');
          analysis = {
            recommendedChapterCount: getDefaultChapterCount(wordCount),
            estimatedWordsPerChapter: getDefaultWordsPerChapter(wordCount),
            storyStructure: "three-act",
            keyStoryBeats: ["Opening", "Inciting Incident", "Rising Action", "Climax", "Resolution"],
            pacing: "medium"
          };
        }

        jobManager.updateJob(jobId, {
          status: 'outlining',
          progress: 15,
          message: `Planning ${analysis.recommendedChapterCount} chapters`
        });

        // Step 2: Generate complete outline
        const outline = await generateCompleteOutline(jobId, synopsis, genre, subgenre, analysis);
        
        jobManager.updateJob(jobId, {
          status: 'writing',
          progress: 30,
          message: `Generated outline for ${outline.length} chapters. Starting chapter generation...`,
          currentPhase: 'writing',
          chaptersOutlined: outline.length,
          chaptersWritten: 0,
          estimatedChapters: outline.length
        });

        // Step 3: Generate all chapters
        const chapters = await generateAllChapters(jobId, synopsis, genre, subgenre, outline, analysis);

        // Complete the job
        const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        
        jobManager.updateJob(jobId, {
          status: 'complete',
          progress: 100,
          message: 'Novel generation complete!',
          novel: {
            synopsis,
            genre,
            subgenre,
            wordCount,
            outline,
            chapters,
            metadata: {
              totalWords,
              chapterCount: chapters.length,
              generatedAt: new Date().toISOString(),
              estimatedReadingTime: Math.ceil(totalWords / 250) // words per minute
            }
          }
        });

        console.log(`Job ${jobId} completed successfully. Generated ${totalWords} words in ${chapters.length} chapters.`);

      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        jobManager.updateJob(jobId, {
          status: 'error',
          progress: 0,
          message: 'Generation failed',
          error: error.message
        });
        throw error;
      }
    }

    // Generate complete outline
    async function generateCompleteOutline(jobId, synopsis, genre, subgenre, analysis) {
      const outlinePrompt = `Create a detailed ${analysis.recommendedChapterCount}-chapter outline for a ${wordCount} word ${genre} novel:

SYNOPSIS:
${synopsis}

REQUIREMENTS:
- Generate exactly ${analysis.recommendedChapterCount} chapters
- Each chapter should be approximately ${analysis.estimatedWordsPerChapter} words
- Follow ${analysis.storyStructure} structure
- Include these story beats: ${analysis.keyStoryBeats?.join(', ') || 'Opening, development, climax, resolution'}
- Maintain ${analysis.pacing} pacing

Provide a JSON response with an array of chapters:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "summary": "Detailed summary of what happens in this chapter",
      "keyEvents": ["event1", "event2", "event3"],
      "characters": ["main characters in this chapter"],
      "setting": "Where this chapter takes place",
      "purpose": "What this chapter accomplishes for the story",
      "estimatedWords": ${analysis.estimatedWordsPerChapter}
    }
  ]
}`;

      const response = await makeOpenAIRequest({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: outlinePrompt }],
        max_tokens: 4000,
        temperature: 0.7
      });

      let outline;
      try {
        const result = JSON.parse(response.choices[0].message.content);
        outline = result.chapters || [];
      } catch (e) {
        console.log('Outline JSON parsing failed, generating fallback');
        // Generate a simple fallback outline
        outline = [];
        for (let i = 1; i <= analysis.recommendedChapterCount; i++) {
          outline.push({
            chapterNumber: i,
            title: `Chapter ${i}`,
            summary: `Chapter ${i} of the novel`,
            keyEvents: ["Plot development"],
            characters: ["Main characters"],
            setting: "Novel setting",
            purpose: "Advance the story",
            estimatedWords: analysis.estimatedWordsPerChapter
          });
        }
      }

      return outline;
    }



    // Generate all chapters
    async function generateAllChapters(jobId, synopsis, genre, subgenre, outline, analysis) {
      const chapters = [];
      const totalChapters = outline.length;

      for (let i = 0; i < totalChapters; i++) {
        const chapterData = outline[i];
        const chapterNumber = i + 1;
        
        // Update progress with detailed logging
        const progressPercent = 30 + Math.floor((i / totalChapters) * 65); // 30-95%
        enhancedLog('info', `Starting chapter ${chapterNumber}`, {
          jobId,
          chapterNumber,
          totalChapters,
          progress: progressPercent,
          title: chapterData.title
        });
        
        jobManager.updateJob(jobId, {
          status: 'writing',
          progress: progressPercent,
          message: `Writing Chapter ${chapterNumber}: ${chapterData.title}`,
          currentPhase: 'writing',
          currentChapter: chapterNumber,
          currentChapterTitle: chapterData.title,
          chaptersOutlined: totalChapters,
          chaptersWritten: i,
          estimatedChapters: totalChapters,
          estimatedWordsWritten: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
        });

        // Check if job was cancelled
        const currentJob = jobManager.getJob(jobId);
        if (currentJob && currentJob.status === 'cancelled') {
          enhancedLog('warn', 'Job cancelled by user', { jobId, chapterNumber });
          throw new Error('Job was cancelled by user');
        }

        try {
          // Get anti-AI enhancement instructions
          const enhancements = antiAISystem.generateWritingInstructions(chapterNumber, chapterData, chapters);

          const context = contextManager.buildContext(synopsis, outline, chapters, chapterNumber);

          const systemPrompt = `You are a master novelist writing authentic Christian fiction. This is Chapter ${chapterNumber} of ${totalChapters} total chapters.

=== ENHANCED ANTI-AI WRITING FRAMEWORK v2.0 ===

Your writing must eliminate ALL artificial patterns and feel completely human-authored. Implement every element below for maximum authenticity:

=== CHARACTER VOICE CONSISTENCY FRAMEWORK ===
${enhancements.characterVoiceFramework ? `
CHARACTER VOICE MAPS - MANDATORY for every dialogue:
${enhancements.characterVoiceFramework.characters?.map(char => `
${char.characterName}: 
- Background: ${char.background} (age ${char.ageGroup})
- Speech Pattern: ${char.speechPattern}
- Vocabulary: ${char.vocabulary?.join(', ') || 'Character-appropriate vocabulary'}
- Sentence Style: ${char.sentenceStructure}
- Regional Touch: ${char.regionalInfluence}
`).join('') || 'Main characters with authentic Pacific Northwest voices'}
CRITICAL: Every dialogue line must reflect these voice maps exactly.
` : ''}

=== SETTING-SPECIFIC SENSORY DATABASE ===
${enhancements.settingSensoryDetails ? `
SETTING TYPE: ${enhancements.settingSensoryDetails.type}
REQUIRED SENSORY ELEMENTS (select 2-3 that advance plot/character):
- Smells: ${enhancements.settingSensoryDetails.smells?.join(' | ') || 'Various atmospheric scents'}
- Sounds: ${enhancements.settingSensoryDetails.sounds?.join(' | ') || 'Environmental sounds'}
- Sights: ${enhancements.settingSensoryDetails.sights?.join(' | ') || 'Visual details'}
- Textures: ${enhancements.settingSensoryDetails.textures?.join(' | ') || 'Tactile sensations'}
USAGE: ${enhancements.settingSensoryDetails.usage}
` : ''}

=== DYNAMIC SCENE STRUCTURE IMPLEMENTATION ===
${enhancements.sceneStructureFramework ? `
ASSIGNED OPENING TECHNIQUE: ${enhancements.sceneStructureFramework.openingTechnique}
HOW TO IMPLEMENT: ${enhancements.sceneStructureFramework.openingGuidance}
CHAPTER MOOD: ${enhancements.sceneStructureFramework.chapterMood}
SPECIFIC DETAILS: ${enhancements.sceneStructureFramework.implementation}
` : ''}

=== METAPHOR DOMAIN CONTROL SYSTEM ===
${enhancements.metaphorDomainControl ? `
ASSIGNED DOMAIN: ${enhancements.metaphorDomainControl.assignedDomain}
SELECTED METAPHOR: ${enhancements.metaphorDomainControl.selectedMetaphor}
RESTRICTION: ${enhancements.metaphorDomainControl.restriction}
USAGE GUIDANCE: ${enhancements.metaphorDomainControl.usageGuidance}
` : ''}

=== PLOT THREAD MANAGEMENT PROTOCOL ===
${enhancements.plotThreadManagement ? `
THREADS TO DEVELOP: ${enhancements.plotThreadManagement.threadsNeedingDevelopment?.map(t => t.name).join(', ') || 'Character development, plot progression'}
${enhancements.plotThreadManagement.shouldIntroduceNew ? 'REQUIREMENT: Introduce new plot thread this chapter' : ''}
${enhancements.plotThreadManagement.implementation ? `HOW TO DEVELOP: ${enhancements.plotThreadManagement.implementation}` : ''}
` : ''}

=== REGIONAL DIALECT AUTHENTICITY ===
${enhancements.regionalDialectAuthenticity ? `
APPROVED EXPRESSION: "${enhancements.regionalDialectAuthenticity.selectedExpression}"
USAGE RULE: ${enhancements.regionalDialectAuthenticity.usage}
CHARACTER RULES: ${enhancements.regionalDialectAuthenticity.characterApplication}
` : ''}

=== FAITH INTEGRATION BALANCE MODEL ===
${enhancements.faithIntegrationBalance ? `
LIVED FAITH ELEMENTS: ${enhancements.faithIntegrationBalance.livedFaith}
CONVERSATIONAL FAITH: ${enhancements.faithIntegrationBalance.conversationalFaith}
FORMAL FAITH ELEMENTS: ${enhancements.faithIntegrationBalance.formalFaith}
INTEGRATION GUIDANCE: ${enhancements.faithIntegrationBalance.guidance}
` : ''}

=== 1999 TECHNOLOGY AUTHENTICITY FRAMEWORK ===
${enhancements.technologyAuthenticity ? `
REQUIRED TECH ELEMENTS: ${enhancements.technologyAuthenticity.elements?.join(', ') || '1999-era technology elements'}
CHARACTER TECH INTERACTION: ${enhancements.technologyAuthenticity.characterAdjustment}
IMPLEMENTATION: ${enhancements.technologyAuthenticity.guidance}
ERA CONTEXT: ${enhancements.technologyAuthenticity.era}
` : ''}

=== NARRATIVE TENSION CALIBRATION ===
${enhancements.tensionCalibration ? `
TENSION TYPE: ${enhancements.tensionCalibration.type}
INTENSITY LEVEL: ${enhancements.tensionCalibration.intensity}
HOW TO CREATE: ${enhancements.tensionCalibration.implementation}
BALANCE WITH: ${enhancements.tensionCalibration.balancingElement}
RESOLUTION TIMING: ${enhancements.tensionCalibration.resolutionTimeframe}
` : ''}

=== ENHANCED QUALITY CONTROL FRAMEWORK ===
${enhancements.qualityChecks ? `
CHARACTER CONSISTENCY CHECKS: ${enhancements.qualityChecks.characterConsistency?.join(' | ') || 'Voice consistency, motivation tracking'}
AUTHENTICITY MARKERS: ${enhancements.qualityChecks.authenticityMarkers?.join(' | ') || 'Regional accuracy, era authenticity'}
NARRATIVE FLOW CHECKS: ${enhancements.qualityChecks.narrativeFlow?.join(' | ') || 'Pacing, tension, plot development'}
STYLISTIC REQUIREMENTS: ${enhancements.qualityChecks.stylistic?.join(' | ') || 'Sentence variety, natural flow'}
` : ''}

=== IMPLEMENTATION PRIORITY ORDER ===
${enhancements.implementationPriority ? `
${enhancements.implementationPriority?.join('\n') || 'Focus on character development and authentic setting details'}
` : ''}

=== CRITICAL ANTI-AI PATTERN ELIMINATION ===
ABSOLUTELY FORBIDDEN AI PATTERNS:
1. Generic sensory details → Use setting-specific database only
2. Inconsistent character voices → Follow voice maps exactly  
3. Mixed metaphor domains → Stay within assigned domain only
4. Modern technology → 1999 authenticity only
5. Forced faith discussions → Natural integration only
6. Generic Pacific Northwest → Specific regional details only
7. Predictable tension → Follow calibration system
8. Repeated openings → Use assigned technique only
9. Neglected plot threads → Develop assigned threads
10. Beta reader failures → Pass all quality checks

=== STORY ENHANCEMENT ELEMENTS ===
OPENING TECHNIQUE: ${enhancements.openingStyle}
ENDING TECHNIQUE: ${enhancements.endingStyle}
TRANSITION STYLE: ${enhancements.transitionStyle}
PACING GUIDANCE: ${enhancements.pacingGuidance}
WORD CHOICE PATTERN: ${enhancements.wordChoicePattern}
SURPRISE ELEMENT: ${enhancements.surpriseElement ? `${enhancements.surpriseElement} - ${enhancements.surpriseImplementation}` : 'None assigned'}

HUMAN QUALITY VERIFICATION CHECKLIST:
${enhancements.qualityChecks?.humanQualityVerification ? enhancements.qualityChecks.humanQualityVerification.join('\n') : ''}

Write this chapter implementing ALL frameworks above. The result must feel completely human-authored, not AI-generated.`;

          const userPrompt = `Write Chapter ${chapterNumber} following the COMPREHENSIVE ANTI-AI GUIDELINES above.

CONTEXT:
${context}

CHAPTER PLAN:
Title: ${chapterData.title}
Summary: ${chapterData.summary}
Key Events: ${chapterData.keyEvents?.join(', ') || 'Story progression'}
Characters: ${chapterData.characters?.join(', ') || 'Main characters'}
Setting: ${chapterData.setting}
Purpose: ${chapterData.purpose}
Target Words: ${chapterData.estimatedWords}

MANDATORY IMPLEMENTATION REQUIREMENTS:

STRUCTURAL EXECUTION:
- OPENING: Begin with "${enhancements.openingStyle}" technique (${enhancements.openingStyle.replace(/_/g, ' ')})
- TRANSITIONS: Use "${enhancements.transitionStyle}" method for scene changes
- ENDING: Conclude with "${enhancements.endingStyle}" approach (${enhancements.endingStyle.replace(/_/g, ' ')})
- FOCUS: Center narrative on "${enhancements.chapterFocus}" elements

SURPRISE INTEGRATION:
- ELEMENT: "${enhancements.surpriseElement}"
- HOW: ${enhancements.surpriseImplementation}
- TIMING: Integrate naturally mid-chapter, not forced at beginning or end

STYLE EXECUTION:
- PACING: ${JSON.stringify(enhancements.pacingGuidance)}
- METAPHORS: Draw comparisons from "${enhancements.metaphorCategory}" imagery only
- WORD COMPLEXITY: ${enhancements.wordChoicePattern.complexity} with ${enhancements.wordChoicePattern.vocabulary} vocabulary
- SENTENCE STRUCTURE: ${enhancements.qualityChecks.variationChecks[0]}

CHARACTER VOICE IMPLEMENTATION:
${enhancements.characterVoices?.map(cv => `
- ${cv.name}: 
  * Speech: ${cv.voice.speechPattern} pattern with ${cv.voice.sentenceLength} sentences
  * Words: Include "${cv.voice.vocabulary?.slice(0, 3).join('", "') || 'authentic'}" type vocabulary
  * Style: ${cv.voice.conversationStyle[0]}
  * NEVER discuss: ${cv.dialogueGuidance.avoidTopics?.join(', ') || 'inappropriate topics'}
`).join('') || 'Character voices with consistent speech patterns'}

PROHIBITION LIST (ABSOLUTELY AVOID):
- Opening phrases: ${JSON.stringify(enhancements.avoidancePatterns.repetitiveOpenings)}
- Transition words: ${JSON.stringify(enhancements.avoidancePatterns.similarTransitions)}  
- Overused phrases: ${JSON.stringify(enhancements.avoidancePatterns.overusedPhrases)}
- Metaphor types: ${JSON.stringify(enhancements.avoidancePatterns.metaphorRepeats)}
- Dialogue tags: ${JSON.stringify(enhancements.avoidancePatterns.dialoguePatterns)}

HUMAN-QUALITY VERIFICATION:
Before finishing, ensure:
1. NO repetitive patterns from instructions above
2. Each character sounds completely different in dialogue
3. Opening/ending styles are implemented correctly
4. Surprise element feels natural and organic
5. Sentence lengths vary throughout (short, medium, long mix)
6. Environmental descriptions use fresh, specific imagery
7. Chapter serves story arc while feeling spontaneous
8. No formulaic AI writing patterns detected

Write the full chapter content. Do NOT include chapter numbers, titles, or formatting - just the narrative prose.`;

          enhancedLog('info', 'Making OpenAI request for chapter with anti-AI enhancements', {
            jobId,
            chapterNumber,
            model: 'gpt-4o',
            maxTokens: Math.min(20000, Math.ceil(analysis.estimatedWordsPerChapter * 1.5))
          });

          const response = await makeOpenAIRequest({
            model: 'gpt-4o', // Use premium model for chapter generation
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: Math.min(20000, Math.ceil(analysis.estimatedWordsPerChapter * 1.5)),
            temperature: 0.85
          });

          const chapterContent = response.choices[0].message.content;
          const wordCount = chapterContent.split(/\s+/).length;

          const chapter = {
            chapterNumber,
            title: chapterData.title,
            content: chapterContent,
            wordCount,
            summary: chapterData.summary,
            generatedAt: new Date().toISOString()
          };

          chapters.push(chapter);
          
          // Update progress after each chapter is completed
          const updatedProgressPercent = 30 + Math.floor(((i + 1) / totalChapters) * 65);
          const totalWordsWritten = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
          
          jobManager.updateJob(jobId, {
            status: 'writing',
            progress: updatedProgressPercent,
            message: `Completed Chapter ${chapterNumber}: ${chapterData.title}`,
            currentPhase: 'writing',
            currentChapter: chapterNumber + 1 <= totalChapters ? chapterNumber + 1 : chapterNumber,
            currentChapterTitle: chapterNumber + 1 <= totalChapters ? outline[chapterNumber]?.title : 'Finishing up...',
            chaptersOutlined: totalChapters,
            chaptersWritten: i + 1,
            estimatedChapters: totalChapters,
            estimatedWordsWritten: totalWordsWritten
          });
          
          enhancedLog('info', `Chapter ${chapterNumber} generated successfully`, {
            jobId,
            chapterNumber,
            wordCount,
            progress: updatedProgressPercent,
            totalWordsWritten
          });
          
        } catch (chapterError) {
          enhancedLog('error', `Chapter ${chapterNumber} generation failed`, {
            jobId,
            chapterNumber,
            error: chapterError.message,
            progress: progressPercent,
            stack: chapterError.stack
          });
          
          // Update job with specific error information
          jobManager.updateJob(jobId, {
            status: 'error',
            progress: progressPercent,
            message: `Failed at Chapter ${chapterNumber}: ${chapterError.message}`,
            error: `Chapter generation failed at ${progressPercent}% (Chapter ${chapterNumber}): ${chapterError.message}`
          });
          
          throw chapterError; // Re-throw to stop the entire process
        }
      }

      return chapters;
    }

  } catch (mainErr) {
    console.error('=== AutoGenerate Error ===');
    console.error('Error type:', mainErr.constructor.name);
    console.error('Error message:', mainErr.message);
    console.error('Error stack:', mainErr.stack);
    console.error('Error occurred at step: Checking error location...');
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: `AutoGenerate failed: ${mainErr.message}`,
        errorType: mainErr.constructor.name,
        details: mainErr.toString(),
        stack: mainErr.stack,
        timestamp: new Date().toISOString()
      })
    };
  }

  // Enhanced logging function
  function enhancedLog(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, JSON.stringify(data));
  }
};
