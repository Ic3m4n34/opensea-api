const Apify = require('apify');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const express = require('express');

const NodeCache = require('node-cache');

const detailCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
});

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/get-collection-details/:collectionName', async (req, res) => {
  const { collectionName } = req.params;

  if (detailCache.get(collectionName)) {
    res.send(detailCache.get(collectionName));
  } else {
    const browser = await Apify.launchPuppeteer({
      useChrome: true,
      stealth: true,
      launchOptions: {
        headless: true,
      },
    });
    const page = await browser.newPage();

    await page.goto(`https://opensea.io/collection/${collectionName}`);

    const content = await page.content();
    const $ = cheerio.load(content);

    // get details
    const items = $('#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.CollectionHeaderreact__DivContainer-sc-1woywpk-0.jgfqaE > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.hZGRPw.jYqxGr > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.InfoContainerreact__InfoContainer-sc-15x3z7c-0.CollectionStatsBarreact__Container-sc-8gdi9o-0.dBFmez.jYqxGr.hRmGRk.bnjiCA > div:nth-child(1) > a > div > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.dBFmez.jYqxGr.Info--icon > h3 > div').text();
    const owners = $('#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.CollectionHeaderreact__DivContainer-sc-1woywpk-0.jgfqaE > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.hZGRPw.jYqxGr > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.InfoContainerreact__InfoContainer-sc-15x3z7c-0.CollectionStatsBarreact__Container-sc-8gdi9o-0.dBFmez.jYqxGr.hRmGRk.bnjiCA > div:nth-child(2) > a > div > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.dBFmez.jYqxGr.Info--icon > h3 > div').text();
    const floorPrice = $('#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.CollectionHeaderreact__DivContainer-sc-1woywpk-0.jgfqaE > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.hZGRPw.jYqxGr > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.InfoContainerreact__InfoContainer-sc-15x3z7c-0.CollectionStatsBarreact__Container-sc-8gdi9o-0.dBFmez.jYqxGr.hRmGRk.bnjiCA > div.Blockreact__Block-sc-1xf18x6-0.InfoItemreact__BlockContainer-sc-gubhmc-0.dBFmez.ipynZW > div > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.dBFmez.jYqxGr.Info--icon > h3 > div').text();
    const volumeTraded = $('#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.CollectionHeaderreact__DivContainer-sc-1woywpk-0.jgfqaE > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.hZGRPw.jYqxGr > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.InfoContainerreact__InfoContainer-sc-15x3z7c-0.CollectionStatsBarreact__Container-sc-8gdi9o-0.dBFmez.jYqxGr.hRmGRk.bnjiCA > div:nth-child(4) > a > div > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.dBFmez.jYqxGr.Info--icon').text();

    await page.close();
    await browser.close();

    const returnValues = {
      items,
      owners,
      floorPrice,
      volumeTraded,
      crawlDateTime: +new Date(),
    };

    detailCache.set(collectionName, returnValues);

    res.send(returnValues);
  }
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
