/**
 * Class name joiner.
 *
 * shadcn's `cn` pairs clsx with tailwind-merge to resolve conflicting utilities.
 * Nothing here relies on that conflict resolution — classes are composed, not
 * overridden — so this stays a dependency-free join rather than pulling in two
 * packages for a feature the codebase does not use.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
