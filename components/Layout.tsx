import { Box } from 'components/primitives'
import { FC, ReactNode, useMemo } from 'react'
import Navbar from './navbar'
import { usePathname } from 'next/navigation'


type Props = {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  const pathname = usePathname()
  const shouldShowNavBar = useMemo(() => {
    const check = pathname.match(/^\/[a-zA-Z]+\/embed\//gi)
    return !check || check.length === 0;
  }, [pathname])

  return (
    <>
      <Box
        css={{
          background: shouldShowNavBar ?'$neutralBg': undefined,
          height: '100%',
          minHeight: '100vh',
          pt: shouldShowNavBar ? 80: 0,
        }}
      >
        <Box css={{ maxWidth: 4500, mx: 'auto' }}>
          {shouldShowNavBar && <Navbar />}
          <main>{children}</main>
        </Box>
      </Box>
    </>
  )
}

export default Layout
