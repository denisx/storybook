import type { ReportNode, Visitor } from 'istanbul-lib-report';
import { ReportBase } from 'istanbul-lib-report';

import { TEST_PROVIDER_ID } from '../constants';
import type { TestManager } from './test-manager';

export default class StorybookCoverageReporter extends ReportBase implements Partial<Visitor> {
  #testManager: TestManager;

  constructor(opts: { testManager: TestManager }) {
    super();
    this.#testManager = opts.testManager;
  }

  onSummary(node: ReportNode) {
    if (!node.isRoot()) {
      return;
    }
    const coverageSummary = node.getCoverageSummary(false);
    let total = 0;
    let covered = 0;

    for (const metric of Object.values(coverageSummary.data)) {
      total += metric.total;
      covered += metric.covered;
    }

    this.#testManager.sendProgressReport({
      providerId: TEST_PROVIDER_ID,
      details: {
        coverage: {
          status: 'warning', // TODO: determine status based on thresholds/watermarks
          percentage: Math.round((covered / total) * 100),
        },
      },
    });
  }
}
