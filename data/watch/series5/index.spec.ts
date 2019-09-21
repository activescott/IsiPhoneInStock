/* eslint-disable no-console */
import Watches from "./index"

describe("watch/series5", () => {
  let watches: Watches = null

  beforeEach(() => {
    watches = new Watches()
  })

  it.skip("first", () => {
    console.log(
      ".products[0].dimensions.watch_cases_dimensionCaseMaterial:",
      watches.all()[0].dimensions.watch_cases_dimensionCaseMaterial
    )
  })

  describe("mutually exclusive part props", () => {
    it("has btrPart count", () => {
      const count = watches.all().filter(p => "btrPart" in p).length
      expect(count).toStrictEqual(44)
    })

    it("has btrPart only count", () => {
      const count = watches.all().filter(p => "btrPart" in p && !("part" in p))
        .length
      expect(count).toStrictEqual(44)
    })

    it("has part count", () => {
      const count = watches.all().filter(p => "part" in p).length
      expect(count).toStrictEqual(450)
    })

    it("has part only count", () => {
      const count = watches.all().filter(p => "part" in p && !("btrPart" in p))
        .length
      expect(count).toStrictEqual(450)
    })
  })

  describe("filter", () => {
    it("all", () => {
      const count = watches.all().length
      expect(count).toStrictEqual(494)
    })

    it("ceramic", () => {
      const count = watches.ceramic().all().length
      expect(count).toStrictEqual(21)
    })

    it("titanium", () => {
      const count = watches.titanium().all().length
      expect(count).toStrictEqual(42)
    })

    it("stainless", () => {
      const count = watches.stainless().all().length
      expect(count).toStrictEqual(127)
    })

    it("aluminum", () => {
      const count = watches.aluminum().all().length
      expect(count).toStrictEqual(304)
    })

    it("caseSize44mm", () => {
      const count = watches.caseSize44mm().all().length
      expect(count).toStrictEqual(257)
    })

    it("case color black", () => {
      const count = watches.caseColorSpaceBlack().all().length
      expect(count).toStrictEqual(55)
    })

    it("titantum + caseSize44mm + spaceBlack", () => {
      const all = watches
        .titanium()
        .caseSize44mm()
        .caseColorSpaceBlack()
        .all()
      all.forEach(p => console.log(p.displayName))
      const count = all.length
      expect(count).toStrictEqual(99999)
    })
  })
})
