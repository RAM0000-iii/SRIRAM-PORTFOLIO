// ============================================================
// SRIRAM PORTFOLIO — CENTRALIZED CONFIGURATION
// ============================================================
// Edit this file to update all content across the site.
// No need to touch component files for content changes.
// ============================================================

export const siteConfig = {
  name: 'SRIRAM',
  tagline: 'VIDEO EDITOR / CINEMATOGRAPHER / REEL CREATOR',
  headline: 'TURNING IDEAS INTO\nSCROLL-STOPPING STORIES.',
  subheadline:
    '2nd Year B.Tech CSE student at MRCET College (Maisammaguda). Crafting high-retention Instagram Reels, cinematic shoots, and rhythm-synced visual edits.',

  about: {
    education: 'B.Tech (2nd Year) — CSE General at MRCET College, Maisammaguda',
    location: 'Maisammaguda, Hyderabad',
    intro:
      "I'm Sriram, a video editor, videographer, and Instagram reel creator currently pursuing my 2nd year B.Tech in CSE at MRCET College (Maisammaguda). I combine cinematic shooting techniques with dynamic video editing — syncing pacing, transitions, and sound to turn simple footage into captivating visual stories that stop the scroll.",
    principles: [
      {
        number: '01',
        title: 'STORY & VISION',
        description: 'Every shot, transition, and cut serves an emotional hook.',
      },
      {
        number: '02',
        title: 'RHYTHM & PACING',
        description: 'Tight music sync, speed ramps, and high-retention energy.',
      },
      {
        number: '03',
        title: 'SHOOT TO EDIT',
        description: 'Capturing footage with the final cut, transitions, and music in mind.',
      },
    ],
  },

  // ---- AVATAR -----------------------------------------------
  avatarPath: '/images/sriram-3d.png.png',

  // ---- SHOWREEL ----------------------------------------------
  // Place your showreel video in: public/videos/showreel.mp4
  // Place your poster image in: public/images/showreel-poster.jpg
  showreel: {
    videoPath: '', // e.g. '/videos/showreel.mp4'
    posterPath: '', // e.g. '/images/showreel-poster.jpg'
    caption: 'FEATURED SHOWREEL',
    description: 'A showcase of cinematic shots, rhythm-synced cuts, and Instagram Reels.',
  },

  // ---- PROJECTS / REELS ---------------------------------------
  // HOW TO ADD A NEW VIDEO:
  // 1. Copy your video (e.g. reel1.mp4) into: public/videos/
  // 2. (Optional) Copy a thumbnail image into: public/images/thumbnails/
  // 3. Add an entry below with videoPath: '/videos/reel1.mp4'
  projects: [
    {
      id: '1',
      title: 'Cinematic Reel 01',
      category: 'REELS',
      videoPath: '', // put file in public/videos/reel-01.mp4 and write '/videos/reel-01.mp4'
      thumbnailPath: '', // optional thumbnail e.g. '/images/thumbnails/reel-01.jpg'
      description: 'Dynamic Instagram reel with beat-synced cuts, speed ramps, and cinematic transitions.',
      techniques: ['Beat Sync', 'Speed Ramping', 'Cinematic Shooting'],
      date: '2024',
      externalLink: 'https://www.instagram.com/___ram_07/',
    },
    {
      id: '2',
      title: 'Cinematic Street & Mood',
      category: 'CINEMATIC',
      videoPath: '',
      thumbnailPath: '',
      description: 'Cinematic footage shot and graded with moody color tones, smooth handheld movement, and ambient audio.',
      techniques: ['Cinematic Shooting', 'Color Grading', 'Sound Design'],
      date: '2024',
      externalLink: 'https://www.instagram.com/___ram_07/',
    },
    {
      id: '3',
      title: 'Fast-Paced Reel Edit',
      category: 'REELS',
      videoPath: '',
      thumbnailPath: '',
      description: 'High-energy short-form video edit designed for maximum retention and Instagram virality.',
      techniques: ['Audio Sync', 'Seamless Transitions', 'Hook Timing'],
      date: '2024',
      externalLink: 'https://www.instagram.com/___ram_07/',
    },
    {
      id: '4',
      title: 'Visual Experiment',
      category: 'EXPERIMENTS',
      videoPath: '',
      thumbnailPath: '',
      description: 'Creative video experimenting with mask transitions, motion match-cuts, and unique sound design.',
      techniques: ['Creative Editing', 'Mask Cuts', 'Sound FX'],
      date: '2024',
      externalLink: 'https://www.instagram.com/___ram_07/',
    },
  ],

  categories: ['ALL WORK', 'REELS', 'CINEMATIC', 'EXPERIMENTS'],

  // ---- SKILLS ------------------------------------------------
  skills: [
    {
      number: '01',
      title: 'VIDEO EDITING',
      description: 'Fast-paced, high-retention cuts designed for short-form content and reels.',
    },
    {
      number: '02',
      title: 'CINEMATIC SHOOTING',
      description: 'Hands-on cinematography, framing, camera movement, and aesthetic b-roll capture.',
    },
    {
      number: '03',
      title: 'INSTAGRAM REEL MAKING',
      description: 'Hook creation, trending audio integration, and visual pacing optimized for social feeds.',
    },
    {
      number: '04',
      title: 'TRANSITIONS & PACING',
      description: 'Seamless invisible cuts, motion whip transitions, and speed ramping flow.',
    },
    {
      number: '05',
      title: 'MUSIC & SOUND DESIGN',
      description: 'Precision beat matching, impactful sound effects (whooshes, risers, hits), and audio dynamics.',
    },
    {
      number: '06',
      title: 'COLOR & MOOD',
      description: 'Cinematic color grading, custom LUT application, and mood enhancement.',
    },
  ],

  // ---- PROCESS -----------------------------------------------
  process: [
    {
      number: '01',
      title: 'VISION & SHOOTING',
      description: 'Conceptualize the idea, frame cinematic angles, and capture footage with the final cut in mind.',
    },
    {
      number: '02',
      title: 'RHYTHM & ROUGH CUT',
      description: 'Select the best takes, lock the soundtrack, and sync clip pacing directly to the musical beats.',
    },
    {
      number: '03',
      title: 'SOUND & TRANSITIONS',
      description: 'Incorporate speed ramps, sound effects, invisible whip transitions, and dynamic motion.',
    },
    {
      number: '04',
      title: 'COLOR & FINAL EXPORT',
      description: 'Grade the colors for a cinematic look, sharpen details, and export in 4K / 9:16 vertical quality.',
    },
  ],

  // ---- CONTACT -----------------------------------------------
  contact: {
    email: 'sriram628126@gmail.com',
    phone: '7989480192',
    phoneFormatted: '+91 7989480192',
    whatsapp: 'https://wa.me/917989480192',
    instagram: 'https://www.instagram.com/___ram_07/',
    instagramHandle: '@___ram_07',
    college: 'MRCET College, Maisammaguda',
    course: 'B.Tech 2nd Year (CSE-General)',
    youtube: '',
    twitter: '',
    linkedin: '',
  },
};

export type Project = (typeof siteConfig.projects)[number];
export type Category = (typeof siteConfig.categories)[number];
