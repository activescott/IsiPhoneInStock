import fetch from "isomorphic-fetch"
import { URL } from "url"

export class Server {
  public async query(options: Options): Promise<AvailabilityResponse> {
    const url = new URL("https://www.apple.com/shop/retail/pickup-message")
    for (let i = 0; i < options.parts.length; i++) {
      url.searchParams.set(`parts.${i}`, options.parts[i])
    }
    url.searchParams.set("location", options.location)

    const resp = await fetch(url.href, {
      method: "GET",
      headers: {
        Host: "www.apple.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        //"Accept-Encoding": 'gzip, deflate',
        DNT: 1,
        "X-Requested-With": "XMLHttpRequest",
        //"Referer": 'http://store.apple.com/us/buy-iphone/iphone6/4.7-inch-display-64gb-space-gray-t-mobile',
        Connection: "keep-alive"
      }
    })
    return (await resp.json()).body
  }
}

export interface AvailabilityResponse {
  stores: Store[]
}

export interface Store {
  partsAvailability: PartsAvailabilityMap
  storeEmail: string //'universityvillage@apple.com',
  storeName: string // 'University Village',
  reservationUrl: string // 'http://www.apple.com/retail/universityvillage',
  makeReservationUrl: string // 'http://www.apple.com/retail/universityvillage',
  state: string // 'WA',
  storeImageUrl: string // 'https://rtlimages.apple.com/cmc/dieter/store/4_3/R072.png?resize=828:*&output-format=jpg',
  country: string // 'US',
  city: string // 'Seattle',
  storeNumber: string // 'R072',
  phoneNumber: string // '206-892 0433',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any
  hoursUrl: string
  directionsUrl: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeHours: any
  storelatitude: number
  storelongitude: number
  storedistance: number
  storeDistanceWithUnit: string // '5.3 mi',
  storeDistanceVoText: string // '5.3 mi from 98105',
}

export interface PartsAvailabilityMap {
  [part: string]: PartsAvailability
}

export interface PartsAvailability {
  storePickEligible: boolean
  storeSearchEnabled: boolean
  /**
   * When true indicates the part is available.
   */
  storeSelectionEnabled: boolean
  storePickupQuote: string //'Apple Store Pickup is currently unavailable',
  pickupSearchQuote: string //'Unavailable for Pickup',
  storePickupLabel: string //'Pickup:',
  partNumber: string //'Z0YQ',
  purchaseOption: string //'',
  ctoOptions: string //'',
  storePickupLinkText: string //'Check availability',
  pickupDisplay: string //'ineligible'
}

type Options = QueryOptions

interface QueryOptions {
  /**
   * City or zip
   */
  location: string
  /**
   * The
   */
  parts: string[]
}

// example: https://www.apple.com/shop/retail/pickup-message?parts.0=Z0YQ&location=98033&option.0=MWQR2LL%2FA%2CMWTY2AM%2FA
