/**
 * Maps technology names used on projects to simple-icons slugs.
 *
 * Driven by what the projects actually list rather than a hand-kept showcase
 * list, so the cloud cannot end up advertising something that appears nowhere
 * in the work. Anything without an icon (GANs, SHAP, Riverpod, MobileNetV2)
 * simply has no entry and is skipped — the text toolkit below still names them.
 *
 * Slugs are matched case-insensitively after stripping punctuation, so
 * "Next.js", "nextjs" and "NEXT.JS" all resolve.
 */
const TECH_SLUGS: Record<string, string> = {
  // Languages
  python: "python",
  typescript: "typescript",
  javascript: "javascript",
  dart: "dart",
  sql: "postgresql",

  // Backend
  fastapi: "fastapi",
  django: "django",
  sqlalchemy: "sqlalchemy",
  celery: "celery",
  redis: "redis",
  postgresql: "postgresql",
  postgres: "postgresql",

  // Frontend and mobile
  nextjs: "nextdotjs",
  react: "react",
  react18: "react",
  tailwindcss: "tailwindcss",
  redux: "redux",
  reduxtoolkit: "redux",
  flutter: "flutter",
  materialdesign: "materialdesign",
  material3: "materialdesign",
  googlemaps: "googlemaps",

  // ML and AI
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  tflite: "tensorflow",
  scikitlearn: "scikitlearn",
  opencv: "opencv",
  pandas: "pandas",
  numpy: "numpy",
  arduino: "arduino",

  // Infrastructure
  docker: "docker",
  dockercompose: "docker",
  githubactions: "githubactions",
  nginx: "nginx",
  sentry: "sentry",
  stripe: "stripe",
  awss3: "amazonwebservices",
  aws: "amazonwebservices",
  git: "git",
  github: "github",
  linux: "linux",
  vercel: "vercel",
};

function normalise(tech: string): string {
  return tech.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves a list of technology names to unique icon slugs, preserving the
 * order they first appear so the cloud is stable between renders.
 */
export function slugsForTech(techLists: string[][]): string[] {
  const slugs: string[] = [];

  for (const tech of techLists.flat()) {
    const slug = TECH_SLUGS[normalise(tech)];
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }

  return slugs;
}
