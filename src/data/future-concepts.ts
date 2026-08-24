export const caseyReviewQuestions = [
  'Which parts of the Future website feel most like East Coast Foam, and what should change before it is shared?',
  'Does the Guided Estimate ask the right early questions without making a customer work too hard?',
  'Which founder or company-story facts are ready to publish, and which should wait for confirmation?',
  'Which licenses, training, manufacturer relationships, warranties, payment options, or financing details are approved for public use?',
  'Are any associations or memberships—such as SPFA, HBALC, ICAA, or Savannah HBA—current and appropriate to mention?',
  'Which competitors feel closest, and what should make East Coast Foam clearly different?',
  'What information do you most need to see at the start of a workday?',
  'Which follow-ups or project details are easiest to lose track of today?',
  'Would anyone besides Casey need a shared view of work that needs attention?',
  'How do project photos move from the jobsite to the website today?',
  'Would a local-first capture flow help at job sites with weak service?',
  'Who should decide when a project can be shared publicly?',
  'Which existing systems should remain the source of truth for scheduling, estimates, and accounting?',
  'Would an organized project history help explain work to future customers?',
  'What should happen after a completed job: follow-up, review request, project story, or none of these?'
];

export const ownerWorkspaceQuestions = [
  caseyReviewQuestions[6],
  caseyReviewQuestions[7],
  caseyReviewQuestions[8],
  caseyReviewQuestions[12],
  caseyReviewQuestions[13]
];

export const projectCaptureQuestions = [
  caseyReviewQuestions[9],
  caseyReviewQuestions[10],
  caseyReviewQuestions[11],
  caseyReviewQuestions[12],
  caseyReviewQuestions[14]
];

export const captureWorkflow = [
  'Real job',
  'Capture project details',
  'Add photos by role',
  'Save on this device',
  'Sync when connected',
  'Review before public use'
];

export const captureStates = [
  ['Saved on this device', 'A local draft is available on this phone.'],
  ['Waiting for connection', 'Nothing has left the device yet.'],
  ['Uploading', 'A future service would show progress honestly.'],
  ['Sent', 'Only shown after a successful synchronization.']
];
