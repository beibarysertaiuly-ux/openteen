import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { demoUsers } from '../utils/demoData'

export default function PrototypeBanner() {
  const { isDemo, currentUser, switchDemoUser, startDemo } = useStore()
  const navigate = useNavigate()
  return <aside className="bg-purple-50 text-purple-950 border-b border-purple-200 px-4 py-3 text-sm">
    <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div><strong>OpenTeens · Local prototype</strong><p className="text-xs mt-1">{isDemo
        ? 'Fictional profiles and sample conversation. Switch roles to try both sides.'
        : 'A demonstration of English practice through shared interests. Use sample details only.'}</p></div>
      {isDemo && <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="demo-role">View as</label>
        <select id="demo-role" className="rounded border border-purple-300 bg-white p-2" value={currentUser?.id}
          onChange={e => { switchDemoUser(e.target.value); navigate('/swipe') }}>
          {demoUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button className="underline" onClick={() => {
          if (window.confirm('Reset fictional demo profiles and conversations?')) { startDemo(); navigate('/swipe') }
        }}>Reset demo</button>
      </div>}
    </div>
  </aside>
}
