import { Button, Flex, IconButton } from "@chakra-ui/react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const Pagination = ({ pagesCount, currentPage, handleCurrentPageChange }) => {

    const pages = Array.from({ length: pagesCount }, (v, i) => i);

    const goToPrevious = () => {
        handleCurrentPageChange(Math.max(0, currentPage - 1));
    }
    const goToNext = () => {
        handleCurrentPageChange(Math.min(pagesCount - 1, currentPage + 1));
    }

    return (
        <Flex
            gap={2}
            justifyContent='center'
        >
            {pagesCount > 1 &&
                (<IconButton
                    variant='ghost'
                    fontSize={{ base: 'xs', md: 'md' }}
                    icon={<FiChevronLeft />}
                    onClick={goToPrevious}
                />)}
            {pages.map((pageIndex) => (
                <Button
                    key={pageIndex}
                    isActive={pageIndex === currentPage}
                    onClick={() => handleCurrentPageChange(pageIndex)}
                    display={{ base: 'none', md: 'flex' }}
                >
                    {pageIndex + 1}
                </Button>
            ))}
            {
                pagesCount > 1 &&
                (<IconButton
                    variant='ghost'
                    fontSize={{ base: 'xs', md: 'md' }}
                    icon={<FiChevronRight />}
                    onClick={goToNext}
                />)
            }


        </Flex>
    )
}

export default Pagination
