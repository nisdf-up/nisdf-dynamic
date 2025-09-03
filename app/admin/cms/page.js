'use client'
import { useEffect, useState } from 'react'
import Section from '../../../components/Section'

function TabBtn({label,active,onClick}){ return <button onClick={onClick} className={'px-3 py-2 '+(active?'border-b-2 border-blue-600 font-medium':'')}>{label}</button> }

export default function CMS(){
  const [tab,setTab]=useState('events')
  return (<Section title="CMS">
    <div className="flex gap-3 border-b mb-4">
      <TabBtn label="Events" active={tab==='events'} onClick={()=>setTab('events')} />
      <TabBtn label="News" active={tab==='news'} onClick={()=>setTab('news')} />
      <TabBtn label="Partners" active={tab==='partners'} onClick={()=>setTab('partners')} />
      <TabBtn label="Posts" active={tab==='posts'} onClick={()=>setTab('posts')} />
    </div>
    {tab==='events' && <Crud base="/api/admin/events" fields={['title','start_at','end_at','location','description']} />}
    {tab==='news' && <Crud base="/api/admin/news" fields={['title','published_at','body']} />}
    {tab==='partners' && <Crud base="/api/admin/partners" fields={['name','url']} />}
    {tab==='posts' && <Crud base="/api/admin/posts" fields={['title','slug','excerpt','body','language']} />}
  </Section>)
}

function Crud({ base, fields }){
  const [list,setList]=useState([])
  const [msg,setMsg]=useState(null)
  const [item,setItem]=useState({})
  async function load(){ const r=await fetch(base); const d=await r.json(); if(!r.ok){ setMsg('Error: '+d.error); return } setList(d.items) }
  useEffect(()=>{ load() },[base])
  async function save(e){ e.preventDefault(); const r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify(item)}); const d=await r.json(); if(!r.ok){ alert('Error: '+d.error); return } setItem({}); load() }
  async function del(id){ if(!confirm('Delete?')) return; const r=await fetch(base+'?id='+id,{method:'DELETE'}); const d=await r.json(); if(!r.ok){ alert('Error: '+d.error); return } load() }
  return (<div className="grid md:grid-cols-2 gap-6">
    <div>
      <h3 className="font-medium mb-2">Create / Update</h3>
      <form onSubmit={save} className="grid gap-2">
        {fields.map(f => <input key={f} value={item[f]||''} onChange={e=>setItem({...item,[f]:e.target.value})} placeholder={f} className="border p-2 rounded" />)}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
    <div>
      <h3 className="font-medium mb-2">List</h3>
      <ul className="space-y-2">{list.map(it => <li key={it.id} className="border rounded p-2 flex justify-between items-center"><span>{it.title||it.name||it.slug}</span><span className="flex gap-2"><button className="px-2 py-1 border rounded" onClick={()=>setItem(it)}>Edit</button><button className="px-2 py-1 border rounded" onClick={()=>del(it.id)}>Delete</button></span></li>)}</ul>
    </div>
  </div>)
}
