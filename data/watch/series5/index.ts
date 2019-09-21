import section1 from "./watch-series5-section1"
import section2 from "./watch-series5-section2"
import section3 from "./watch-series5-section3"
import section4 from "./watch-series5-section4"
import { WatchProduct } from "./WatchProduct"

const reduction = [section1, section2, section3, section4].reduce(
  (accumulator, currentValue) => {
    currentValue.products = [...currentValue.products, ...accumulator.products]

    for (const propName in accumulator.dictionaries) {
      if (propName === "dimensions") {
        // go one level deeper and then copy entries
        for (const dimensionsPropName in accumulator.dictionaries[propName]) {
          Object.assign(
            currentValue.dictionaries[propName][dimensionsPropName],
            accumulator.dictionaries[propName][dimensionsPropName]
          )
        }
      } else {
        // shallow copy:
        currentValue.dictionaries[propName] = {
          ...currentValue.dictionaries[propName],
          ...accumulator.dictionaries[propName]
        }
      }
    }
    return currentValue
  }
)

export default class Watches {
  public constructor(private rawWatches?: WatchProduct[]) {
    if (!rawWatches) {
      this.rawWatches = reduction.products as WatchProduct[]
    }
  }

  public all(): WatchProduct[] {
    return this.rawWatches as WatchProduct[]
  }

  public filterProducts(predicate: Predicate<WatchProduct>): Watches {
    return new Watches(Array.prototype.filter.call(this.all(), predicate))
  }

  public stainless(): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionCaseMaterial === "stainless"
    )
  }

  public titanium(): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionCaseMaterial === "titanium"
    )
  }

  public aluminum(): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionCaseMaterial === "aluminum"
    )
  }

  public ceramic(): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionCaseMaterial === "ceramic"
    )
  }

  public caseSize(caseSize: string): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionCaseSize === caseSize
    )
  }

  public caseSize44mm(): Watches {
    return this.caseSize("44mm")
  }

  public caseColor(color: string): Watches {
    return this.filterProducts(
      p => p.dimensions.watch_cases_dimensionColor === color
    )
  }

  public caseColorSpaceBlack(): Watches {
    return this.caseColor("spaceblack")
  }
}

interface Predicate<TItem> {
  (item: TItem): boolean
}
