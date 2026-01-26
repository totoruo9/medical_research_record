import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register the Korean font
Font.register({
    family: 'NanumGothic',
    fonts: [
        { src: '/fonts/NanumGothic-Regular.ttf' },
        { src: '/fonts/NanumGothic-Bold.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'NanumGothic',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#111827',
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    heading1: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#111827',
    },
    heading2: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#374151',
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
        paddingLeft: 5,
    },
    text: {
        fontSize: 11,
        marginBottom: 5,
        lineHeight: 1.5,
        color: '#374151',
    },
    // Table Styles
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#E5E7EB',
        marginBottom: 10,
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%', // Default, logic should adjust
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
    },
    tableCell: {
        margin: 5,
        fontSize: 10,
        color: '#374151',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 9,
    },
});

interface ReportPDFProps {
    report: any;
}

const renderTable = (tableLines: string[], keyPrefix: number) => {
    // Parse header
    const headerLine = tableLines[0];
    const headerCols = headerLine.split('|').filter(c => c.trim() !== '').map(c => c.trim());

    // Parse rows (skip index 1 which is separator |---|)
    const dataRows = tableLines.slice(2).map(line => {
        return line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
    });

    // Calculate width (simple equal width for now)
    const colWidth = `${100 / headerCols.length}%`;

    return (
        <View style={styles.table} key={`table-${keyPrefix}`}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                {headerCols.map((col, idx) => (
                    <View style={[styles.tableCol, { width: colWidth }]} key={`th-${idx}`}>
                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{col}</Text>
                    </View>
                ))}
            </View>
            {/* Rows */}
            {dataRows.map((row, rIdx) => (
                <View style={styles.tableRow} key={`tr-${rIdx}`}>
                    {row.map((cell, cIdx) => (
                        <View style={[styles.tableCol, { width: colWidth }]} key={`td-${rIdx}-${cIdx}`}>
                            <Text style={styles.tableCell}>{cell}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

// Simple Markdown stripper/formatter for PDF
const renderMarkdown = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    // Regex to remove emojis
    const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

    for (let i = 0; i < lines.length; i++) {
        // Strip emojis and trim
        const rawLine = lines[i].replace(emojiRegex, '');
        const line = rawLine.trim();

        // Skip empty separator lines
        if (line === '---' || line === '***') continue;

        // Check if line looks like a table row: starts and ends with | or contains multiple |
        const isTableLine = line.startsWith('|') && line.includes('|', 1);

        if (isTableLine) {
            if (!inTable) inTable = true;
            tableBuffer.push(line);
        } else {
            if (inTable) {
                // End of table
                elements.push(renderTable(tableBuffer, i));
                tableBuffer = [];
                inTable = false;
            }

            if (!line) {
                elements.push(<Text key={i} style={{ marginBottom: 5 }}> </Text>);
                continue;
            }

            if (line.startsWith('# ')) {
                elements.push(<Text key={i} style={styles.heading1}>{line.replace('# ', '')}</Text>);
            } else if (line.startsWith('## ')) {
                elements.push(<Text key={i} style={styles.heading2}>{line.replace('## ', '')}</Text>);
            } else if (line.startsWith('### ')) {
                elements.push(<Text key={i} style={{ ...styles.heading2, fontSize: 12 }}>{line.replace('### ', '')}</Text>);
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                elements.push(<Text key={i} style={{ ...styles.text, paddingLeft: 10 }}>• {line.substring(2)}</Text>);
            } else {
                // Remove bold/italic markers for clean text
                const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '');
                elements.push(<Text key={i} style={styles.text}>{cleanText}</Text>);
            }
        }
    }

    // Flush remaining table
    if (inTable && tableBuffer.length > 0) {
        elements.push(renderTable(tableBuffer, lines.length));
    }

    return elements;
};

export const ReportPDF = ({ report }: ReportPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>AI 정밀 분석 리포트</Text>
                <Text style={styles.subtitle}>
                    {format(new Date(report.created_at), 'yyyy년 MM월 dd일 HH:mm')}
                </Text>
            </View>

            <View style={styles.section}>
                {renderMarkdown(report.content)}
            </View>

            <View style={styles.footer}>
                <Text>* 본 리포트는 AI 보조 분석 결과이며, 의학적 진단을 대신할 수 없습니다.</Text>
            </View>
        </Page>
    </Document>
);
