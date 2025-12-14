import { useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { toast } from 'react-hot-toast'

export default function Verify() {
  useEffect(() => {
    // @ts-ignore global injected by _document
    const Html5Qrcode = (globalThis as any).Html5Qrcode
    if (!Html5Qrcode) return
    const html5QrCode = new Html5Qrcode("reader")
    Html5Qrcode.getCameras().then((cameras: any[]) => {
      if (cameras && cameras.length) {
        const cameraId = cameras[0].id
        html5QrCode.start(cameraId, { fps: 10, qrbox: 250 }, async (decodedText: string) => {
          const toastId = toast.loading('Verifying ticket...')
          try {
            const res = await fetch('/api/verify-ticket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: decodedText }) })
            const j = await res.json()
            if (j.valid) {
              toast.success(`Valid Ticket! ID: ${j.id}`, { id: toastId, duration: 5000 })
            } else {
              toast.error(`Invalid: ${j.reason || 'Unknown error'}`, { id: toastId, duration: 5000 })
            }
          } catch (e) {
            toast.error('Verification failed', { id: toastId })
          }
          await html5QrCode.stop()
        })
      }
    }).catch((e: any) => console.error(e))
    return () => { try { html5QrCode.stop() } catch (e) { } }
  }, [])

  return (
    <div className="max-w-3xl mx-auto pt-10">
      <Card className="p-8 text-center space-y-4 glass-card">
        <h1 className="text-3xl font-display font-bold text-white">Verify Ticket</h1>
        <p className="text-slate-300">Open camera and scan the ticket QR code below.</p>
        <div className="mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/20">
          <div id="reader" style={{ width: '100%', maxWidth: 500 }} />
        </div>
      </Card>
    </div>
  )
}
