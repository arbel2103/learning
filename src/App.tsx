import { useStore } from './store/useStore'
import ProjectBar from './components/ProjectBar'
import TopicTabs from './components/TopicTabs'
import Notebook from './components/learning/Notebook'

export default function App() {
  const projects = useStore((s) => s.projects)
  const sel = useStore((s) => s.selection)

  const project = projects.find((p) => p.id === sel.projectId) ?? null
  const topic = project?.topics.find((t) => t.id === sel.topicId) ?? null
  const subtopic = topic?.subtopics.find((s) => s.id === sel.subtopicId) ?? null

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ProjectBar />

      {project ? (
        <>
          <TopicTabs project={project} />
          <main className="flex-1">
            {subtopic ? (
              <Notebook subtopic={subtopic} />
            ) : (
              <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted">
                {topic
                  ? 'בחרו תת-נושא (או הוסיפו אחד) כדי להתחיל ללמוד ✍️'
                  : 'הוסיפו נושא ותת-נושא כדי להתחיל'}
              </div>
            )}
          </main>
        </>
      ) : (
        <div className="mx-auto max-w-4xl flex-1 px-4 py-16 text-center text-muted">
          אין פרויקטים — צרו פרויקט חדש מהסרגל למעלה ➕
        </div>
      )}

      <footer className="border-t border-line py-4 text-center text-xs text-muted">
        מרחב הלמידה · הנתונים נשמרים מקומית בדפדפן שלך
      </footer>
    </div>
  )
}
