import "server-only";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

export type CoachingPdfMetric = {
  label: string;
  value: string;
};

export type CoachingPdfSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type CoachingPdfDefinition = {
  title: string;
  eyebrow: string;
  subtitle: string;
  memberName: string;
  metrics?: CoachingPdfMetric[];
  sections: CoachingPdfSection[];
  footerNote?: string;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f5ede2",
    color: "#1f1711",
    fontSize: 10.5,
    lineHeight: 1.5,
    paddingTop: 34,
    paddingBottom: 38,
    paddingHorizontal: 34,
  },
  brand: {
    color: "#8d6b3d",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  subtitle: {
    color: "#5d554d",
    fontSize: 11,
    lineHeight: 1.55,
    marginTop: 10,
  },
  preparedFor: {
    color: "#5d554d",
    fontSize: 10,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    marginBottom: 6,
  },
  metricCard: {
    backgroundColor: "#fffaf3",
    borderColor: "#d7c3a5",
    borderWidth: 1,
    borderRadius: 12,
    minWidth: "47%",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    color: "#6d645b",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 4,
  },
  section: {
    marginTop: 18,
    paddingTop: 14,
    borderTopColor: "#d8cec1",
    borderTopWidth: 1,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  paragraph: {
    color: "#2d241e",
    marginBottom: 7,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 5,
  },
  bulletMark: {
    fontSize: 11,
    width: 10,
  },
  bulletText: {
    color: "#2d241e",
    flex: 1,
  },
  footer: {
    color: "#6d645b",
    fontSize: 8.5,
    left: 34,
    position: "absolute",
    right: 34,
    bottom: 18,
    textAlign: "left",
  },
  pageNumber: {
    color: "#6d645b",
    fontSize: 8.5,
    position: "absolute",
    right: 34,
    bottom: 18,
  },
});

function CoachingPdfDocument({ definition }: { definition: CoachingPdfDefinition }) {
  return (
    <Document author="Twigthetics" title={definition.title}>
      <Page size="LETTER" style={styles.page} wrap>
        <Text style={styles.brand}>{definition.eyebrow}</Text>
        <Text style={styles.title}>{definition.title}</Text>
        <Text style={styles.subtitle}>{definition.subtitle}</Text>
        <Text style={styles.preparedFor}>Prepared for {definition.memberName}</Text>

        {definition.metrics?.length ? (
          <View style={styles.metricsGrid}>
            {definition.metrics.map((metric) => (
              <View key={`${metric.label}-${metric.value}`} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {definition.sections.map((section) => (
          <View key={section.heading} style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.paragraphs?.map((paragraph, index) => (
              <Text key={`${section.heading}-paragraph-${index}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet, index) => (
              <View key={`${section.heading}-bullet-${index}`} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          {definition.footerNote ||
            "Twigthetics coaching materials are meant to be executed consistently before they are adjusted aggressively."}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export async function renderCoachingPdf(definition: CoachingPdfDefinition) {
  return renderToBuffer(<CoachingPdfDocument definition={definition} />);
}
