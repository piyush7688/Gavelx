import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import API from '../api'

export default function ExportPDF() {
  const username = localStorage.getItem('username')

  const exportPDF = async () => {
    try {
      const [historyRes, creditsRes] = await Promise.all([
        API.get('/bids/my/history'),
        API.get('/credits/balance')
      ])

      const history = historyRes.data
      const credits = creditsRes.data.credits

      const doc = new jsPDF()

      // Header background
      doc.setFillColor(15, 15, 0)
      doc.rect(0, 0, 210, 40, 'F')

      // Logo
      doc.setFontSize(28)
      doc.setTextColor(245, 158, 11)
      doc.setFont('helvetica', 'bold')
      doc.text('GavelX', 14, 22)

      // Subtitle
      doc.setFontSize(11)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.text('Bid History Report', 14, 32)

      // Date
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 32)

      // User info card
      doc.setFillColor(25, 25, 25)
      doc.roundedRect(14, 48, 182, 28, 3, 3, 'F')

      doc.setFontSize(11)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text(`Bidder: ${username}`, 22, 60)

      doc.setFontSize(10)
      doc.setTextColor(245, 158, 11)
      doc.text(`Credits remaining: ${credits}`, 22, 70)

      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Total bids placed: ${history.length}`, 120, 60)

      const wins = history.filter(b => b.is_winning).length
      doc.setTextColor(34, 197, 94)
      doc.text(`Auctions won: ${wins}`, 120, 70)

      // Table title
      doc.setFontSize(13)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('Bidding History', 14, 92)

      // Table
      if (history.length === 0) {
        doc.setFontSize(11)
        doc.setTextColor(100, 100, 100)
        doc.text('No bids placed yet.', 14, 105)
      } else {
        autoTable(doc, {
          startY: 98,
          head: [['Bid ID', 'Auction ID', 'Amount (Credits)', 'Date & Time', 'Status']],
          body: history.map(bid => [
            `#${bid.id}`,
            `Auction #${bid.auction_id}`,
            `${bid.amount} credits`,
            new Date(bid.timestamp + 'Z').toLocaleString(),
            bid.is_winning ? 'Winner' : 'Active'
          ]),
          headStyles: {
            fillColor: [245, 158, 11],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fillColor: [20, 20, 20],
            textColor: [200, 200, 200],
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [28, 28, 28]
          },
          columnStyles: {
            4: {
              fontStyle: 'bold',
              textColor: (row) => row.raw === 'Winner' ? [245, 158, 11] : [100, 100, 100]
            }
          },
          styles: {
            lineColor: [40, 40, 40],
            lineWidth: 0.1
          }
        })
      }

      // Summary section
      const finalY = doc.lastAutoTable?.finalY || 110
      doc.setFillColor(15, 15, 0)
      doc.roundedRect(14, finalY + 10, 182, 36, 3, 3, 'F')

      doc.setFontSize(11)
      doc.setTextColor(245, 158, 11)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', 22, finalY + 22)

      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')

      const totalSpent = history
        .filter(b => b.is_winning)
        .reduce((sum, b) => sum + b.amount, 0)

      doc.text(`Total bids: ${history.length}`, 22, finalY + 32)
      doc.text(`Auctions won: ${wins}`, 80, finalY + 32)
      doc.text(`Total credits spent: ${totalSpent}`, 140, finalY + 32)
      doc.text(`Current balance: ${credits} credits`, 22, finalY + 40)

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      doc.text('GavelX — Next Generation Auction Platform', 14, 285)
      doc.text(`Page 1`, 190, 285, { align: 'right' })

      doc.save(`GavelX_BidHistory_${username}_${Date.now()}.pdf`)

    } catch (err) {
      console.error('PDF export error:', err)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <button style={styles.btn} onClick={exportPDF}>
      Export PDF
    </button>
  )
}

const styles = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: 'transparent',
    color: '#f59e0b',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}