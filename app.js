// ==========================================================================
// DATASET DEFINITION (Source Data: 2020 - 2026)
// ==========================================================================
const financialData = [
    { year: 2020, debt: 91706800, debtReduction: -3366800, debtPct: -3.81, savings: 4080000, savingsIncrease: 2080000, savingsPct: 50.98 },
    { year: 2021, debt: 90410000, debtReduction: 1296800, debtPct: 1.41, savings: 15276000, savingsIncrease: 11196000, savingsPct: 73.29 },
    { year: 2022, debt: 93205000, debtReduction: -2795000, debtPct: -3.09, savings: 13780000, savingsIncrease: -1496000, savingsPct: -10.86 },
    { year: 2023, debt: 95038000, debtReduction: -1833000, debtPct: -1.97, savings: 12640000, savingsIncrease: -1140000, savingsPct: -9.02 },
    { year: 2024, debt: 76410000, debtReduction: 18628000, debtPct: 19.60, savings: 13860000, savingsIncrease: 1220000, savingsPct: 8.80 },
    { year: 2025, debt: 59240000, debtReduction: 17170000, debtPct: 22.47, savings: 17817000, savingsIncrease: 3957000, savingsPct: 22.21 },
    { year: 2026, debt: 46178000, debtReduction: 13062000, debtPct: 22.05, savings: 11328000, savingsIncrease: -6489000, savingsPct: -57.28 }
];

// ==========================================================================
// FORMATTING UTILITIES (COP & PERCENT)
// ==========================================================================
const formatCOP = (val) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(absVal);
    return (isNegative ? '-$' : '$') + formatted;
};

const formatPct = (val) => {
    const formatted = new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
    return formatted + '%';
};

const formatShortCOP = (val) => {
    const absVal = Math.abs(val);
    let result = '';
    if (absVal >= 1000000) {
        result = '$' + (absVal / 1000000).toFixed(1) + 'M';
    } else if (absVal >= 1000) {
        result = '$' + (absVal / 1000).toFixed(0) + 'K';
    } else {
        result = '$' + absVal;
    }
    return (val < 0 ? '-' : '') + result;
};

// ==========================================================================
// TABLE POPULATION
// ==========================================================================
const populateTable = () => {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    financialData.forEach(row => {
        const tr = document.createElement('tr');

        // Debt cells formatting
        const debtRedClass = row.debtReduction >= 0 ? 'text-green' : 'text-red';
        const debtRedBadge = row.debtReduction >= 0 ? 'badge-green' : 'badge-red';
        
        // Savings cells formatting
        const savingsIncClass = row.savingsIncrease >= 0 ? 'text-green' : 'text-red';
        const savingsIncBadge = row.savingsIncrease >= 0 ? 'badge-green' : 'badge-red';

        tr.innerHTML = `
            <td class="text-center font-semibold">${row.year}</td>
            <td class="text-right">${formatCOP(row.debt)}</td>
            <td class="text-right ${debtRedClass}">${formatCOP(row.debtReduction)}</td>
            <td class="text-center">
                <span class="cell-badge ${debtRedBadge}">${formatPct(row.debtPct)}</span>
            </td>
            <td class="text-right">${formatCOP(row.savings)}</td>
            <td class="text-right ${savingsIncClass}">${formatCOP(row.savingsIncrease)}</td>
            <td class="text-center">
                <span class="cell-badge ${savingsIncBadge}">${formatPct(row.savingsPct)}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// ==========================================================================
// APEXCHARTS INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Populate the records table
    populateTable();

    // Export to CSV button trigger
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Año,Saldo Deuda,Reducción Deuda,% Disminución,Saldo Ahorro,Aumento Ahorro,% Aumento\n";
            financialData.forEach(row => {
                csvContent += `${row.year},${row.debt},${row.debtReduction},${row.debtPct}%,${row.savings},${row.savingsIncrease},${row.savingsPct}%\n`;
            });
            // Append totals
            csvContent += `TOTALES/CIERRE,46178000,42162000,47.73%,11328000,9328000,82.34%\n`;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "resumen_financiero_2020_2026.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Extraction of series data
    const years = financialData.map(d => d.year);
    const debts = financialData.map(d => d.debt);
    const savings = financialData.map(d => d.savings);
    
    const debtReductions = financialData.map(d => d.debtReduction);
    const debtPcts = financialData.map(d => d.debtPct);
    
    const savingsIncreases = financialData.map(d => d.savingsIncrease);
    const savingsPcts = financialData.map(d => d.savingsPct);

    // Common styling configs
    const commonChartOptions = {
        theme: { mode: 'dark' },
        chart: {
            fontFamily: 'Outfit, sans-serif',
            background: 'transparent',
            toolbar: { show: false }
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.05)',
            strokeDashArray: 4
        },
        legend: { show: false }
    };

    // ----------------------------------------------------------------------
    // CHART 1: Trajectory of Balances (Area Line)
    // ----------------------------------------------------------------------
    const optionsTrajectory = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'area',
            height: 380,
            zoom: { enabled: false }
        },
        colors: ['#ff5e62', '#10b981'],
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.25,
                opacityTo: 0.02,
                stops: [0, 95]
            }
        },
        dataLabels: { enabled: false },
        series: [
            { name: 'Deuda', data: debts },
            { name: 'Ahorro', data: savings }
        ],
        xaxis: {
            categories: years,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => formatShortCOP(val),
                style: {
                    colors: '#9ca3af',
                    fontSize: '11px'
                }
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'dark',
            x: { show: true },
            y: {
                formatter: (val) => formatCOP(val)
            }
        }
    };

    const chartTrajectory = new ApexCharts(document.querySelector("#chart-trajectory"), optionsTrajectory);
    chartTrajectory.render();

    // ----------------------------------------------------------------------
    // CHART 2: Debt Reduction per Year (Combined Column + Line)
    // ----------------------------------------------------------------------
    const optionsDebtReduction = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'line',
            height: 280
        },
        colors: ['#ff7f50', '#ffb900'],
        stroke: {
            width: [0, 3],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 6,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        fill: {
            type: ['gradient', 'solid'],
            gradient: {
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#ff5e62'],
                inverseColors: false,
                opacityFrom: 0.85,
                opacityTo: 0.5,
                stops: [0, 100]
            }
        },
        series: [
            { name: 'Reducción Deuda (COP)', type: 'column', data: debtReductions },
            { name: 'Tasa Disminución (%)', type: 'line', data: debtPcts }
        ],
        dataLabels: {
            enabled: true,
            enabledOnSeries: [0, 1],
            style: {
                fontSize: '10px',
                fontFamily: 'Outfit, sans-serif',
                colors: ['#ffffff', '#ffb900']
            },
            background: {
                enabled: true,
                foreColor: '#ffffff',
                padding: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.4)',
                opacity: 0.85
            },
            formatter: function (val, opts) {
                if (opts.seriesIndex === 0) {
                    return formatShortCOP(val);
                }
                return val.toFixed(1) + '%';
            },
            offsetY: -6
        },
        xaxis: {
            categories: years,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '11px'
                }
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Reducción Deuda (COP)',
                    style: { color: '#ff7f50', fontWeight: 500 }
                },
                labels: {
                    formatter: (val) => formatShortCOP(val),
                    style: { colors: '#9ca3af', fontSize: '10px' }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Disminución (%)',
                    style: { color: '#ffb900', fontWeight: 500 }
                },
                labels: {
                    formatter: (val) => val.toFixed(0) + '%',
                    style: { colors: '#9ca3af', fontSize: '10px' }
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'dark',
            y: [
                { formatter: (val) => formatCOP(val) },
                { formatter: (val) => val.toFixed(2) + '%' }
            ]
        }
    };

    const chartDebtReduction = new ApexCharts(document.querySelector("#chart-debt-reduction"), optionsDebtReduction);
    chartDebtReduction.render();

    // ----------------------------------------------------------------------
    // CHART 3: Savings Increase per Year (Combined Column + Line)
    // ----------------------------------------------------------------------
    const optionsSavingsIncrease = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'line',
            height: 280
        },
        colors: ['#10b981', '#00f2fe'],
        stroke: {
            width: [0, 3],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 6,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        fill: {
            type: ['gradient', 'solid'],
            gradient: {
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#059669'],
                inverseColors: false,
                opacityFrom: 0.85,
                opacityTo: 0.5,
                stops: [0, 100]
            }
        },
        series: [
            { name: 'Variación Ahorro (COP)', type: 'column', data: savingsIncreases },
            { name: 'Tasa Aumento (%)', type: 'line', data: savingsPcts }
        ],
        dataLabels: {
            enabled: true,
            enabledOnSeries: [0, 1],
            style: {
                fontSize: '10px',
                fontFamily: 'Outfit, sans-serif',
                colors: ['#ffffff', '#00f2fe']
            },
            background: {
                enabled: true,
                foreColor: '#ffffff',
                padding: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.4)',
                opacity: 0.85
            },
            formatter: function (val, opts) {
                if (opts.seriesIndex === 0) {
                    return formatShortCOP(val);
                }
                return val.toFixed(1) + '%';
            },
            offsetY: -6
        },
        xaxis: {
            categories: years,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '11px'
                }
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Aumento Ahorro (COP)',
                    style: { color: '#10b981', fontWeight: 500 }
                },
                labels: {
                    formatter: (val) => formatShortCOP(val),
                    style: { colors: '#9ca3af', fontSize: '10px' }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Aumento (%)',
                    style: { color: '#00f2fe', fontWeight: 500 }
                },
                labels: {
                    formatter: (val) => val.toFixed(0) + '%',
                    style: { colors: '#9ca3af', fontSize: '10px' }
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'dark',
            y: [
                { formatter: (val) => formatCOP(val) },
                { formatter: (val) => val.toFixed(2) + '%' }
            ]
        }
    };

    const chartSavingsIncrease = new ApexCharts(document.querySelector("#chart-savings-increase"), optionsSavingsIncrease);
    chartSavingsIncrease.render();
});
