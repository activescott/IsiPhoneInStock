export interface WatchProduct {
  /**
   * The part number. This is optional, if not there, see @see btrPart.
   */
  part?: string
  /**
   * The part number. This is optional, if not there, see @see part.
   */
  btrPart?: string
  displayName: string
  dimensions: {
    watch_cases_dimensionCaseSize: string
    watch_cases_dimensionCaseMaterial: string
    watch_cases_dimensionConnection: string
    watch_cases_dimensionCollection: string
    watch_bands_dimensionMaterial: string
    watch_cases_dimensionColor: string
    watch_bands_dimensionColor: string
    watch_bands_dimensionbandsize: string
    watch_bands_dimensionBandColor: string
    watch_bands_dimensionCaseSize: string
  }
}
