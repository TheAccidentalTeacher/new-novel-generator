// AutoGenerate Novel Function - Background Job System with Status Polling
const { OpenAI } = require('openai');

// In-memory job storage (in production, use a database)
const jobStorage = new Map();

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
    const { mode, jobId, synopsis, genre, subgenre, wordCount, userPreferences } = requestData;
    console.log('Step 2: Request data parsed successfully:', { mode, genre, subgenre, wordCount, synopsisLength: synopsis?.length });
    
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
        return await startAutoGeneration(synopsis, genre, subgenre, wordCount, userPreferences);
      
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
    async function startAutoGeneration(synopsis, genre, subgenre, wordCount, prefs = {}) {
      const jobId = generateJobId();
      console.log(`Starting new AutoGenerate job: ${jobId}`);
      
      // Create job in storage
      const job = jobManager.createJob(jobId, synopsis, genre, subgenre, wordCount, prefs);
      
      // Start background processing (non-blocking)
      processNovelGeneration(jobId).catch(error => {
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
          error: job.error
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
          message: `Generated outline for ${outline.length} chapters. Starting chapter generation...`
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
- Include these story beats: ${analysis.keyStoryBeats.join(', ')}
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
        
        // Update progress
        const progressPercent = 30 + Math.floor((i / totalChapters) * 65); // 30-95%
        jobManager.updateJob(jobId, {
          status: 'writing',
          progress: progressPercent,
          message: `Writing Chapter ${chapterNumber}: ${chapterData.title}`
        });

        // Check if job was cancelled
        const currentJob = jobManager.getJob(jobId);
        if (currentJob && currentJob.status === 'cancelled') {
          throw new Error('Job was cancelled by user');
        }

        const context = contextManager.buildContext(synopsis, outline, chapters, chapterNumber);
        
        const systemPrompt = `You are a professional novelist writing a ${genre} novel. You excel at:
- Creating immersive scenes with rich sensory details
- Writing authentic dialogue that reveals character
- Building tension and emotional resonance
- Maintaining consistency across the narrative
- Following genre conventions while being original`;

        const userPrompt = `Write Chapter ${chapterNumber} of this ${genre} novel.

CONTEXT:
${context}

CHAPTER PLAN:
Title: ${chapterData.title}
Summary: ${chapterData.summary}
Key Events: ${chapterData.keyEvents.join(', ')}
Characters: ${chapterData.characters.join(', ')}
Setting: ${chapterData.setting}
Purpose: ${chapterData.purpose}
Target Words: ${chapterData.estimatedWords}

WRITING REQUIREMENTS:
- SHOW, DON'T TELL: Replace exposition with immersive scenes
- RICH DIALOGUE: Authentic conversations with subtext and character-specific voices  
- SENSORY DETAIL: Use all five senses to ground readers in the scene
- SCENE STRUCTURE: Clear objectives, rising tension, meaningful change
- GENRE CONVENTIONS: Honor ${genre} expectations while bringing fresh perspective
- CONTINUITY: Maintain perfect consistency with previous chapters
- PACING: Match the overall story rhythm and build toward climactic moments

Write the complete chapter with proper paragraphs. Do not include chapter numbers or titles - just the chapter content.`;

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
        console.log(`Generated Chapter ${chapterNumber}: ${wordCount} words`);
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
};
