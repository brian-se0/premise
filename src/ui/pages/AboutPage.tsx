export const SOURCE_URL = 'https://github.com/brian-se0/premise';

export function AboutPage() {
  const commit = __COMMIT__;
  return (
    <>
      <h1>About Premise</h1>
      <p>
        Premise is a free, open-source trainer for reasoning skills. You write your analysis of a short argument in your
        own words, then have it graded by an AI chatbot of your choice or grade it yourself against a rubric. Premise
        schedules the tasks you miss for review.
      </p>

      <h2>Privacy</h2>
      <p>
        Premise has no accounts and no server. It keeps your answers and progress on this device and never uploads them;
        it only downloads its own files. When you paste a grading prompt into a chatbot, that service receives your
        answers under its own terms.
      </p>

      <h2>Source code</h2>
      <p>
        <a href={SOURCE_URL}>{SOURCE_URL.replace('https://', '')}</a>
        <br />
        This site was built from commit{' '}
        {commit === 'unknown' ? (
          <code>unknown</code>
        ) : (
          <a href={`${SOURCE_URL}/commit/${commit}`}>
            <code>{commit.slice(0, 7)}</code>
          </a>
        )}
        .
      </p>

      <h2>Licenses</h2>
      <ul>
        <li>
          Code: <a href={`${SOURCE_URL}/blob/main/LICENSE`}>GNU Affero General Public License v3.0 only</a>.
        </li>
        <li>
          Exercises and taxonomy: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>,
          except public-domain and CC BY source text, which keeps its own status and is credited with each exercise.
        </li>
      </ul>
      <p className="meta">
        Premise uses no content from any official test maker and is not affiliated with or endorsed by any testing
        organization.
      </p>
    </>
  );
}
