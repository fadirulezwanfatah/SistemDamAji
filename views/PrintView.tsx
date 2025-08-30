import React, { useState, useEffect } from 'react';
import { useTournamentStore } from '../hooks/useTournamentStore';
import { APP_TITLE, ORGANIZER, EVENT_DETAILS } from '../constants';
import { Match } from '../types';

const PrintView: React.FC = () => {
    const { players, matches } = useTournamentStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // If the store is already hydrated, we can set the state immediately.
        if (useTournamentStore.persist.hasHydrated()) {
            setIsHydrated(true);
            return;
        }

        // Otherwise, subscribe to the hydration event.
        const unsub = useTournamentStore.persist.onFinishHydration(() => setIsHydrated(true));
        
        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        document.title = `Laporan - ${APP_TITLE}`;
        // The timeout gives the browser a moment to render the newly hydrated data.
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [isHydrated]);

    const getMatchResult = (match: Match) => {
        if (!match.isFinished) return 'Belum Selesai';
        if (match.isDraw) return 'Seri';
        if (match.winnerId) {
            const winner = players.find(p => p.id === match.winnerId);
            return `Pemenang: ${winner?.name || 'N/A'}`;
        }
        if (match.playerB === null) return `${match.playerA.name} - Error: Tiada Lawan`;
        return 'N/A';
    };
    
    const groupedMatches = matches.reduce((acc, match) => {
        const round = match.round;
        if (!acc[round]) {
            acc[round] = [];
        }
        acc[round].push(match);
        return acc;
    }, {} as Record<number, Match[]>);

    if (!isHydrated) {
        return (
            <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', textAlign: 'center' }}>
                <h2>Memuatkan Laporan...</h2>
                <p>Sila tunggu sebentar.</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* Override all global styles for print view */
                * {
                    color: #000 !important;
                    background-color: transparent !important;
                }

                html, body {
                    font-family: Arial, sans-serif !important;
                    color: #000 !important;
                    background-color: #fff !important;
                    margin: 0 !important;
                    padding: 2rem !important;
                    line-height: 1.4 !important;
                }

                #root {
                    background-color: #fff !important;
                    color: #000 !important;
                }

                @media print {
                    html, body {
                        -webkit-print-color-adjust: exact !important;
                        margin: 0 !important;
                        padding: 1.5rem !important;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                }
                .print-container {
                    max-width: 1000px !important;
                    margin: 0 auto !important;
                    background-color: #fff !important;
                    color: #000 !important;
                }
                header {
                    text-align: center !important;
                    margin-bottom: 2rem !important;
                    background-color: #fff !important;
                    color: #000 !important;
                }
                header h1 {
                    font-size: 2rem !important;
                    font-weight: bold !important;
                    margin: 0 !important;
                    color: #000 !important;
                }
                header h2 {
                    font-size: 1.25rem !important;
                    margin: 0.25rem 0 !important;
                    color: #333 !important;
                }
                header p {
                    margin: 0.25rem 0 !important;
                    color: #555 !important;
                }
                section {
                    margin-bottom: 3rem !important;
                    background-color: #fff !important;
                    color: #000 !important;
                }
                h3 {
                    font-size: 1.5rem !important;
                    font-weight: bold !important;
                    border-bottom: 2px solid #000 !important;
                    padding-bottom: 0.5rem !important;
                    margin-bottom: 1rem !important;
                    page-break-after: avoid !important;
                    color: #000 !important;
                    background-color: transparent !important;
                }
                h4 {
                    font-size: 1.2rem !important;
                    font-weight: 600 !important;
                    margin-bottom: 0.75rem !important;
                    page-break-after: avoid !important;
                    color: #000 !important;
                    background-color: transparent !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 0.9rem !important;
                    background-color: #fff !important;
                    color: #000 !important;
                }
                th, td {
                    border: 1px solid #ccc !important;
                    padding: 0.5rem !important;
                    text-align: left !important;
                    vertical-align: top !important;
                    color: #000 !important;
                }
                th {
                    background-color: #f2f2f2 !important;
                    font-weight: bold !important;
                    color: #000 !important;
                }
                tbody tr:nth-child(even) {
                    background-color: #f9f9f9 !important;
                }
                tbody tr:nth-child(odd) {
                    background-color: #fff !important;
                }
                .reprint-btn {
                    position: fixed;
                    top: 1rem;
                    right: 1rem;
                    background-color: #007bff;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .reprint-btn:hover { background-color: #0056b3; }
            `}</style>
            
            <div className="print-container">
                <button onClick={() => window.print()} className="no-print reprint-btn">
                    Cetak Semula
                </button>
                
                <header>
                    <h1>{APP_TITLE}</h1>
                    <h2>{EVENT_DETAILS}</h2>
                    <p>Dianjurkan oleh: {ORGANIZER}</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>Tarikh Laporan: {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </header>
                
                <section>
                    <h3>Senarai Peserta ({players.length})</h3>
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}>Bil.</th>
                                <th style={{width: '10%'}}>ID</th>
                                <th>Nama Penuh</th>
                                <th>Persatuan/Daerah</th>
                                <th style={{width: '15%'}}>No. K/P</th>
                                <th style={{width: '15%'}}>No. Telefon</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...players].sort((a,b) => a.id.localeCompare(b.id)).map((player, index) => (
                                <tr key={player.id}>
                                    <td>{index + 1}</td>
                                    <td>{player.id}</td>
                                    <td>{player.name}</td>
                                    <td>{player.association}</td>
                                    <td>{player.icNumber || '-'}</td>
                                    <td>{player.phoneNumber || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
                <div className="page-break"></div>

                <section>
                    <h3>Keputusan Perlawanan</h3>
                    {Object.keys(groupedMatches).length > 0 ? (
                        Object.keys(groupedMatches)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((roundKey) => {
                                const roundMatches = groupedMatches[Number(roundKey)];
                                return (
                                    <div key={roundKey} style={{marginBottom: '2rem'}}>
                                        <h4>Pusingan {roundKey}</h4>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{width: '15%'}}>Meja/Pentas</th>
                                                    <th>Pemain A</th>
                                                    <th>Pemain B</th>
                                                    <th style={{width: '30%'}}>Keputusan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...roundMatches].sort((a,b) => a.table - b.table).map(match => (
                                                    <tr key={match.id}>
                                                        <td>{match.stage || match.table}</td>
                                                        <td>{match.playerA.name}</td>
                                                        <td>{match.playerB ? match.playerB.name : 'BYE'}</td>
                                                        <td>{getMatchResult(match)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })
                    ) : (
                        <p>Tiada perlawanan yang telah dijana.</p>
                    )}
                </section>
            </div>
        </>
    );
};

export default PrintView;