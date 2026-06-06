/* eslint-disable */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Marquee from "react-fast-marquee"

const url = import.meta.env.VITE_APP_API_BASE_URL

function Runner() {
  const [runnerData, setRunnerData] = useState([])

  useEffect(() => {
    async function getRunnerInfo() {
      try {
        const res = await axios.get(`${url}/api/users/runner`)
        setRunnerData(res.data)
      } catch (error) {
        console.error("Failed fetching live runner counters:", error)
      }
    }
    getRunnerInfo()
  }, [])

  return (
    <div className="w-full bg-[#041d24] text-cyan-100 py-2.5 overflow-hidden border-b border-cyan-900/60 shadow-sm select-none">
      <Marquee speed={40} gradient={false} pauseOnHover={true}>
        <div className="flex items-center gap-12 pr-12 whitespace-nowrap">
          <StatGroup title="This Year" data={runnerData?.[0]} highlight={true} />
          <StatGroup title="Last Year" data={runnerData?.[1]} highlight={false} />
        </div>
      </Marquee>
    </div>
  )
}

export default Runner

function StatGroup({ title, data, highlight }) {
  const Sep = () => <div className="w-px h-4 bg-cyan-800/40 shrink-0" />

  const Stat = ({ label, value }) => (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <span className="text-cyan-400/90 font-medium">{label}:</span>
      <span className={value !== undefined && value !== null ? "text-white font-bold tabular-nums" : "animate-pulse"}>
        {value ?? 0}
      </span>
    </div>
  )

  return (
    <div className={`flex items-center gap-4 text-sm font-medium rounded-md pr-3 bg-cyan-950/40 border ${
      highlight ? "border-cyan-500" : "border-cyan-800/40"
    }`}>
      <span className={`px-2.5 py-1.5 rounded-l-md text-[10px] font-bold uppercase tracking-wider ${
        highlight ? "bg-cyan-500 text-cyan-950" : "bg-cyan-800/50 text-cyan-200"
      }`}>
        {title}
      </span>

      <Stat label="Certificates Issued" value={data?.certificateIssued} />
      <Sep />
      <Stat label="Users Joined" value={data?.usersJoined} />
      <Sep />
      <Stat label="Videos Submitted" value={data?.videoUploaded} />
      <Sep />
      <Stat label="Images Submitted" value={data?.imageUploaded} />
    </div>
  )
}