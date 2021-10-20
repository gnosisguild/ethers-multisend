// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title InputsLogger
 * @dev Logs function inputs in events
 */
contract InputsLogger {
    
    struct TestStruct {
        bytes8 bytesMember;
        bool boolMember;
    }
    
    // event inputs logging
    event InputsLogged(string stringParam, address[2] fixedSizeAddressArrayParam, int[][] int2DArrayParam, TestStruct tupleParam);
    
    function logInputs(string calldata stringParam, address[2] calldata fixedSizeAddressArrayParam, int[][] calldata int2DArrayParam, TestStruct calldata tupleParam) external {
        emit InputsLogged(stringParam, fixedSizeAddressArrayParam, int2DArrayParam, tupleParam);
    }

    // a function with unnamed param
    function logInputs(string calldata, address[2] calldata fixedSizeAddressArrayParam) external {
        emit InputsLogged("", fixedSizeAddressArrayParam, new int[][](0), TestStruct("", false));
    }

}