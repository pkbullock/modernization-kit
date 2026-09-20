export const processSteps = [
  {
    slug: 'identify',
    title: 'Identify',
    eyebrow: 'Stage 1',
    summary: 'Inventory sites, pages, and usage signals before a Page Modernisation project begins.',
    tasks: ['Record the classic sites and pages in scope, including their owners.', 'Review page usage and business value to identify candidates for modernisation.', 'Identify custom layouts, web parts, and dependencies that need investigation.'],
    outcome: 'Agree an initial page inventory with site owners, including candidates to retain, modernise, or retire.',
    sections: [
      { slug: 'placeholder', title: 'Identify placeholder' }
    ]
  },
  {
    slug: 'plan',
    title: 'Plan',
    eyebrow: 'Stage 2',
    summary: 'Prepare scope, target layouts, adoption materials, and supporting project assets for Page Modernisation.',
    tasks: ['Agree scope, delivery roles, and a representative pilot with site owners.', 'Plan target layouts and mapping requirements for the selected pages.', 'Define review criteria, rollout communications, and a recovery approach.'],
    outcome: 'Confirm the pilot scope, target experience, and approval process before any conversion begins.',
    sections: [
      { slug: 'placeholder', title: 'Plan placeholder' }
    ]
  },
  {
    slug: 'modernise',
    title: 'Modernise',
    eyebrow: 'Stage 3',
    summary: 'Convert pages with mappings, supporting tools, and repeatable Page Modernisation guidance.',
    tasks: ['Validate mappings against representative source pages in a test environment.', 'Run an agreed pilot with explicit write operations and structured conversion logs.', 'Record unsupported content and conversion issues for review.'],
    outcome: 'Hand over converted draft pages and their conversion records for review. Conversion does not imply approval to publish.',
    sections: [
      { slug: 'placeholder', title: 'Modernise placeholder' }
    ]
  },
  {
    slug: 'review',
    title: 'Review',
    eyebrow: 'Stage 4',
    summary: 'Capture feedback, assign reviewers, and track approval before publishing Page Modernisation work.',
    tasks: ['Ask page owners to verify content, links, metadata, and the target layout.', 'Check accessibility, mobile presentation, and any custom components.', 'Log issues, assign follow-up work, and capture an explicit approval decision.'],
    outcome: 'Resolve blocking issues and record approval for each page before scheduling its publication.',
    sections: [
      { slug: 'placeholder', title: 'Review placeholder' }
    ]
  },
  {
    slug: 'publish',
    title: 'Publish',
    eyebrow: 'Stage 5',
    summary: 'Publish approved pages and keep Page Modernisation rollout tracking aligned with project status.',
    tasks: ['Confirm recorded approvals, publishing permissions, and the agreed rollout window.', 'Have an authorised owner publish the approved pages and verify the live experience.', 'Update tracking records, communicate the change, and monitor feedback.'],
    outcome: 'Confirm the published pages with site owners and retain the rollout records and recovery information.',
    sections: [
      { slug: 'placeholder', title: 'Publish placeholder' }
    ]
  }
];

export const repoUrl = 'https://github.com/pkbullock/modernization-kit';

export const getProcessStepBySlug = (slug) => processSteps.find((step) => step.slug === slug);

export const getProcessPathDetails = (pathname = '/') => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const hasBasePath = basePath && (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`));
  const pathWithoutBase = hasBasePath
    ? normalizedPath.slice(basePath.length) || '/'
    : normalizedPath;
  const segments = pathWithoutBase.split('/').filter(Boolean);

  return {
    stageSlug: segments[0] ?? null,
    sectionSlug: segments[1] ?? null
  };
};
