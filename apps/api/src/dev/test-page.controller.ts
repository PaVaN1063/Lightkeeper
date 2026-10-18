import { Controller, Get, Header, NotFoundException, Post, Redirect } from '@nestjs/common';

/**
 * A fake "exam results" page for testing alerts without waiting for a real site.
 *   - Watch:   http://<your-pc>:3000/dev/test-page   with the goal "Tell me when the result is out"
 *   - Control: http://localhost:3000/dev/control      to publish or hide the result, or change the price
 * Only available when ALLOW_PRIVATE_URLS=true (development).
 */
const state = { resultPublished: false, price: 52999, notices: 1 };

function enabled() {
  if (process.env.ALLOW_PRIVATE_URLS !== 'true') throw new NotFoundException();
}

const page = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lightkeeper test page</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;line-height:1.5;color:#0E1726}
.box{border:1px solid #DFE4EE;border-radius:12px;padding:16px;margin:12px 0}button{font:inherit;padding:10px 16px;border-radius:10px;border:0;background:#FFB547;font-weight:700;cursor:pointer;margin:4px 8px 4px 0}
.muted{color:#5E6B85}a{color:#9A5B00}</style></head><body>${body}</body></html>`;

@Controller('dev')
export class TestPageController {
  @Get('test-page')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  testPage() {
    enabled();
    const notices = Array.from({ length: state.notices }, (_v, i) => `<li>Notice ${i + 1}: Exam schedule update ${i + 1}</li>`).join('');
    return page(`
<h1>Test Board of Examinations</h1>
<div class="box"><h2>Latest notices</h2><ul>${notices}</ul></div>
<div class="box"><h2>Results 2026</h2>${
      state.resultPublished
        ? `<p><a href="/dev/test-page/result.pdf">Download Final Result 2026 (PDF)</a></p><p>The final result 2026 has been declared.</p>`
        : `<p class="muted">Results will be announced soon.</p>`
    }</div>
<div class="box"><h2>Test product</h2><p>Test Phone 13 (256 GB)</p><p>Price: ₹${state.price.toLocaleString('en-IN')}</p></div>`);
  }

  @Get('test-page/result.pdf')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  resultFile() {
    enabled();
    return 'This is where the real result PDF would be.';
  }

  @Get('control')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  control() {
    enabled();
    return page(`
<h1>Test page controls</h1>
<p class="muted">Change the <a href="/dev/test-page" target="_blank">test page</a>, then tap <b>Check now</b> on the watch in the app (or wait for the next scheduled check).</p>
<div class="box"><b>Result:</b> ${state.resultPublished ? 'published' : 'not published yet'}<br>
<form method="post" action="/dev/control/result" style="display:inline"><button>${state.resultPublished ? 'Hide result' : 'Publish result'}</button></form></div>
<div class="box"><b>Price:</b> ₹${state.price.toLocaleString('en-IN')}<br>
<form method="post" action="/dev/control/price-down" style="display:inline"><button>Drop price by ₹1,500</button></form>
<form method="post" action="/dev/control/price-reset" style="display:inline"><button>Reset to ₹52,999</button></form></div>
<div class="box"><b>Notices:</b> ${state.notices}<br>
<form method="post" action="/dev/control/notice" style="display:inline"><button>Add a notice (any change)</button></form></div>`);
  }

  @Post('control/result')
  @Redirect('/dev/control', 303)
  toggleResult() {
    enabled();
    state.resultPublished = !state.resultPublished;
  }

  @Post('control/price-down')
  @Redirect('/dev/control', 303)
  priceDown() {
    enabled();
    state.price = Math.max(1000, state.price - 1500);
  }

  @Post('control/price-reset')
  @Redirect('/dev/control', 303)
  priceReset() {
    enabled();
    state.price = 52999;
  }

  @Post('control/notice')
  @Redirect('/dev/control', 303)
  addNotice() {
    enabled();
    state.notices += 1;
  }
}
